# Hướng dẫn triển khai gửi email với AhaSend (Gói miễn phí)

> **Tài liệu tham khảo:** [AhaSend Docs](https://ahasend.com/docs) | [Quickstart](https://ahasend.com/docs/quickstart)

---

## 1. Tổng quan AhaSend

- **Gói miễn phí:** 1.000 emails/tháng
- **Hai cách gửi:** HTTP API hoặc SMTP Relay
- **Có chế độ Sandbox:** Test mà không gửi email thật, không tính vào quota

### Lưu ý quan trọng về Domain

| Chế độ | Domain verify | Gửi thật đến người nhận? | Ghi chú |
|--------|---------------|--------------------------|---------|
| **Production** | Bắt buộc | Có | Cần add domain + DNS (SPF, DKIM, DMARC) |
| **Sandbox** | Không bắt buộc* | Không | Chỉ simulate, không gửi thật |

\* Sandbox chủ yếu dùng để test luồng code và webhook, email không đến hộp thư người nhận.

**Gửi đến email bất kỳ:** Bạn luôn có thể chỉ định `to` là bất kỳ địa chỉ email nào. Không cần verify địa chỉ người nhận; chỉ cần verify domain **người gửi (from)** khi dùng Production.

---

## 2. Các bước setup nhanh (5 phút)

### Bước 1: Đăng ký và xác minh tài khoản

1. Đăng ký: [ahasend.com](https://ahasend.com)
2. Xác minh email qua link trong hộp thư
3. Đăng nhập vào [Dashboard](https://dash.ahasend.com)

### Bước 2: Tạo SMTP credentials

1. Vào **Credentials** trong Dashboard
2. Bấm **Create Credential**
3. Chọn **SMTP**
4. Đặt tên (vd: `Trello Dev SMTP`)
5. **Mode:** chọn **Sandbox** nếu chỉ dev/test; chọn **Production** nếu muốn gửi thật
6. **Scope:** chọn **Global**
7. Bấm **Create Credential** và lưu **username** + **password**

### Bước 3: (Chỉ Production) Add & verify domain

Nếu dùng **Production**, cần:

1. Vào **Domains** → **Add Domain**
2. Nhập domain (vd: `email.tencongty.com`)
3. Thêm DNS records theo hướng dẫn (SPF, DKIM, DMARC)
4. Chờ verify (thường vài phút)

---

## 3. Cấu hình SMTP

| Tham số | Giá trị |
|---------|---------|
| **Host (EU)** | `send.ahasend.com` |
| **Host (US)** | `send-us.ahasend.com` |
| **Port** | 587 (khuyến nghị), 25, 2525 |
| **Security** | STARTTLS (requireTLS: true) |
| **Auth** | Username + Password từ Dashboard |

---

## 4. Triển khai với Node.js (dự án Trello hiện tại)

### 4.1 Cập nhật `.env`

Thêm / sửa các biến môi trường:

```env
# AhaSend SMTP
EMAIL_HOST=send.ahasend.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=<SMTP_USERNAME_TỪ_DASHBOARD>
EMAIL_PASS=<SMTP_PASSWORD_TỪ_DASHBOARD>
EMAIL_FROM_NAME=Trello Service
EMAIL_FROM_ADDRESS=your-email@gmail.com
```

**Lưu ý:** Nếu dùng Sandbox, `EMAIL_FROM_ADDRESS` có thể dùng email bất kỳ. Với Production, phải dùng địa chỉ thuộc domain đã verify.

### 4.2 Chỉnh sửa NodeMailerProvider cho AhaSend

File `src/providers/NodeMailerProvider.js` cần dùng `requireTLS` thay vì `secure` để tương thích AhaSend:

```javascript
/**
 * NodeMailerProvider - Gửi email qua SMTP (nodemailer)
 * Hỗ trợ AhaSend: host send.ahasend.com, port 587, requireTLS
 */
import nodemailer from 'nodemailer'
import { env } from '~/config/environment'

const transporter = nodemailer.createTransport({
  host: env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(env.EMAIL_PORT, 10) || 465,
  secure: env.EMAIL_SECURE === 'true',
  requireTLS: env.EMAIL_HOST?.includes('ahasend.com'),
  auth: {
    user: env.EMAIL_USER,
    pass: env.EMAIL_PASS
  }
})

const sendEmail = async ({ to, subject, html }) => {
  const mailOptions = {
    from: `"${env.EMAIL_FROM_NAME || 'Trello Service'}" <${env.EMAIL_FROM_ADDRESS}>`,
    to,
    subject,
    html
  }

  // Thêm header Sandbox nếu dùng credentials Sandbox + muốn chắc chắn simulate
  if (env.EMAIL_SANDBOX === 'true') {
    mailOptions.headers = {
      ...mailOptions.headers,
      'AhaSend-Sandbox': 'true',
      'AhaSend-Sandbox-Result': 'deliver'
    }
  }

  const info = await transporter.sendMail(mailOptions)
  return info
}

export const NodeMailerProvider = { sendEmail }
```

### 4.3 (Tùy chọn) Biến môi trường Sandbox

Nếu dùng credentials Sandbox và muốn bật simulate rõ ràng qua header:

```env
EMAIL_SANDBOX=true
```

---

## 5. Dùng Sandbox với header trong mỗi email

Nếu dùng **Production credentials** nhưng muốn một số email chạy ở chế độ Sandbox:

```javascript
await transporter.sendMail({
  from: '"Trello" <hello@yourdomain.com>',
  to: 'user@example.com',
  subject: 'Test',
  html: '<p>Nội dung test</p>',
  headers: {
    'AhaSend-Sandbox': 'true',
    'AhaSend-Sandbox-Result': 'deliver'  // deliver | bounce | defer | fail | suppress
  }
})
```

---

## 6. Ví dụ gửi email verify (tích hợp userService)

Logic gửi email trong `userService.js` đã tương thích `NodeMailerProvider.sendEmail`. Chỉ cần cấu hình đúng `.env`:

```javascript
await NodeMailerProvider.sendEmail({
  to: getNewUser.email,
  subject: 'Trello: Xác thực email',
  html: `<h3>Link xác thực:</h3><a href="${verificationLink}">Bấm vào đây</a>`
})
```

---

## 7. So sánh nhanh: Sandbox vs Production

| | Sandbox | Production |
|---|---------|------------|
| Domain verify | Không bắt buộc | Bắt buộc |
| Gửi đến hộp thư thật | Không | Có |
| Tính vào quota | Không | Có (1.000/tháng free) |
| Webhook | Có | Có |
| Dùng khi | Dev, test, CI/CD | App thật |

---

## 8. Troubleshooting

### 401 Unauthorized
- Kiểm tra `EMAIL_USER` và `EMAIL_PASS`
- Credentials phải là SMTP (không phải mật khẩu đăng nhập dashboard)

### Domain chưa verify (Production)
- Đảm bảo đã add domain và DNS đúng
- DNS có thể mất 5–30 phút (tối đa ~24h) để cập nhật

### SMTP auth fail
- Thử port **2525** nếu 587 bị chặn
- Kiểm tra `requireTLS: true` và port 587

### Email không đến hộp thư
- Nếu dùng Sandbox: đúng là không gửi thật, chỉ simulate
- Nếu Production: kiểm tra spam, verify domain, kiểm tra dashboard log

---

## 9. Tài liệu tham khảo

- [Quickstart](https://ahasend.com/docs/quickstart)
- [SMTP Node.js](https://ahasend.com/docs/smtp/nodejs)
- [SMTP Sandbox](https://ahasend.com/docs/smtp/sandbox)
- [SMTP Credentials](https://ahasend.com/docs/smtp/credentials)
- [Domain Setup](https://ahasend.com/docs/domains)

---

## 10. Tóm tắt cho “gói miễn phí, không cần domain”

- Dùng **Sandbox Mode**:
  1. Tạo tài khoản AhaSend
  2. Tạo SMTP credential, chọn **Sandbox**
  3. Cấu hình NodeMailer với host `send.ahasend.com`, port 587
  4. Gửi thử – email được xử lý nhưng **không gửi đến hộp thư thật**

- Để **gửi thật đến bất kỳ email nào** (vd: verify tài khoản), cần:
  1. Add và verify domain trong AhaSend
  2. Tạo SMTP credential **Production**
  3. Dùng địa chỉ `from` thuộc domain đã verify

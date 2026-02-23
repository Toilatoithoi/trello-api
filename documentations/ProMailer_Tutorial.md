# Hướng dẫn triển khai gửi email với ProMailer (Render deploy)

> **Vấn đề:** Render (và nhiều cloud provider) chặn các port SMTP outbound (25, 587, 465), nên ứng dụng deploy trên Render không thể kết nối trực tiếp tới SMTP để gửi mail.
>
> **Giải pháp:** [ProMailer](https://www.promailer.xyz/) hoạt động như **gateway**: bạn cấu hình SMTP trên ProMailer, app gọi REST API (HTTPS) thay vì kết nối SMTP trực tiếp → không bị chặn port.

---

## Tài liệu tham khảo

- **ProMailer:** [Documentation](https://www.promailer.xyz/documentation) | [Trang chủ](https://www.promailer.xyz/)
- **Dashboard:** [SMTP Connections](https://www.promailer.xyz/dashboard/smtp) | [API Keys](https://www.promailer.xyz/dashboard/api-keys)
- **Video hướng dẫn (I-Tech Academy):** [Fix Render SMTP Problem Instantly](https://www.youtube.com/watch?v=gdYA1nTRbzQ)

**Lưu ý:** API backend tại `mailserver.automationlounge.com`. Endpoint gửi mail: `POST /api/v1/messages/send`

---

## 1. Tổng quan ProMailer

| Đặc điểm | Mô tả |
|----------|--------|
| **Cách hoạt động** | ProMailer lưu SMTP của bạn, app gửi email qua REST API (HTTPS) |
| **Port** | Không cần mở 465/587 – chỉ dùng HTTPS (443) |
| **Phù hợp** | Render, Vercel, Railway và mọi hosting chặn SMTP |
| **Gói miễn phí** | 500 emails/tháng, 1 kết nối SMTP |

### So sánh: SMTP trực tiếp vs ProMailer

```
SMTP trực tiếp (bị chặn trên Render):
  App → Kết nối SMTP (port 465/587) → Gmail/Outlook
        ❌ Render chặn outbound SMTP

ProMailer (hoạt động trên Render):
  App → POST HTTPS (443) → ProMailer API → ProMailer kết nối SMTP của bạn → Gmail/Outlook
        ✅ Không cần mở port SMTP
```

---

## 2. Các bước setup (5–10 phút)

### Bước 1: Đăng ký tài khoản ProMailer

1. Truy cập: [https://www.promailer.xyz/signup](https://www.promailer.xyz/signup)
2. Đăng ký tài khoản
3. Đăng nhập vào [Dashboard](https://www.promailer.xyz/)

### Bước 2: Thêm SMTP Connection

1. Vào mục **SMTP Connections**
2. Bấm **Add SMTP Connection** (hoặc tương đương)
3. Điền thông tin SMTP của bạn:

| Trường | Gmail ví dụ | Ghi chú |
|--------|-------------|---------|
| **Host** | `smtp.gmail.com` | Host của nhà cung cấp SMTP |
| **Port** | `465` hoặc `587` | 465 = SSL, 587 = STARTTLS |
| **Username** | `your@gmail.com` | Email đăng nhập SMTP |
| **Password** | App Password | Gmail: [App Passwords](https://myaccount.google.com/apppasswords) |
| **Default from address** | `your@gmail.com` | Thường trùng username |
| **From name** | `Trello Service` | Tên hiển thị (tùy chọn) |
| **TLS/SSL** | Bật theo host | Gmail 465: SSL, Gmail 587: TLS |

4. Lưu kết nối và copy **SMTP Connection ID** (sẽ dùng làm `smtpId` khi gọi API)

### Bước 3: Tạo API Key

1. Vào mục **API Keys**
2. Bấm **Create API Key** / **Generate API Key**
3. Copy API key và lưu cẩn thận (chỉ hiển thị 1 lần)

---

## 3. Cấu hình triển khai

### 3.1 Thêm biến môi trường

Thêm vào `.env` (và cấu hình tương ứng trên Render):

```env
# ProMailer (dùng khi deploy trên Render thay cho SMTP trực tiếp)
PROMAILER_API_KEY=<API_KEY_TỪ_DASHBOARD>
PROMAILER_SMTP_ID=<SMTP_CONNECTION_ID>
PROMAILER_BASE_URL=https://mailserver.automationlounge.com
USE_PROMAILER=true

# (Tùy chọn) Nếu Dashboard hiển thị URL khác, override full URL:
# PROMAILER_API_URL=https://mailserver.automationlounge.com/api/v1/messages/send
```

**Lưu ý:**  
- `USE_PROMAILER=true` khi deploy trên Render  
- `USE_PROMAILER=false` hoặc không set khi chạy local (có thể dùng SMTP trực tiếp)

### 3.2 Thêm biến env vào `environment.js`

```javascript
// Trong src/config/environment.js, thêm:
PROMAILER_API_KEY: process.env.PROMAILER_API_KEY,
PROMAILER_SMTP_ID: process.env.PROMAILER_SMTP_ID,
PROMAILER_BASE_URL: process.env.PROMAILER_BASE_URL || 'https://www.promailer.xyz',
USE_PROMAILER: process.env.USE_PROMAILER === 'true',
```

---

## 4. Tạo ProMailerProvider

Tạo file `src/providers/ProMailerProvider.js`:

```javascript
/**
 * ProMailerProvider - Gửi email qua ProMailer REST API
 * Giải pháp khi Render/hosting chặn port SMTP 465/587
 * Interface: sendEmail({ to, subject, html })
 * Docs: https://www.promailer.xyz/documentation
 */
import { env } from '~/config/environment'

const PROMAILER_API_URL = `${(env.PROMAILER_BASE_URL || 'https://www.promailer.xyz').replace(/\/$/, '')}/api/send`

/**
 * Gửi email qua ProMailer API
 * @param {Object} params
 * @param {string} params.to - Email người nhận
 * @param {string} params.subject - Tiêu đề
 * @param {string} params.html - Nội dung HTML
 * @returns {Promise<Object>} Kết quả từ ProMailer API
 */
const sendEmail = async ({ to, subject, html }) => {
  const response = await fetch(PROMAILER_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${env.PROMAILER_API_KEY}`
    },
    body: JSON.stringify({
      smtpId: env.PROMAILER_SMTP_ID,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      text: html.replace(/<[^>]*>/g, '') // Fallback plain text
    })
  })

  if (!response.ok) {
    const errBody = await response.text()
    throw new Error(`ProMailer API error ${response.status}: ${errBody}`)
  }

  return response.json()
}

export const ProMailerProvider = {
  sendEmail
}
```

---

## 5. Chuyển đổi giữa NodeMailer và ProMailer

Có thể dùng một provider thống nhất, chọn theo môi trường.

### Cách 1: Chọn provider theo `USE_PROMAILER`

Tạo `src/providers/emailProvider.js`:

```javascript
/**
 * Email provider thống nhất - tự chọn NodeMailer hoặc ProMailer theo môi trường
 */
import { env } from '~/config/environment'
import { NodeMailerProvider } from '~/providers/NodeMailerProvider'
import { ProMailerProvider } from '~/providers/ProMailerProvider'

// Render chặn SMTP → dùng ProMailer; local có thể dùng NodeMailer
const provider = env.USE_PROMAILER ? ProMailerProvider : NodeMailerProvider

export const EmailProvider = {
  sendEmail: provider.sendEmail
}
```

Sau đó thay mọi chỗ dùng `NodeMailerProvider` bằng `EmailProvider`:

```javascript
// Trước
import { NodeMailerProvider } from '~/providers/NodeMailerProvider'
await NodeMailerProvider.sendEmail({ to, subject, html })

// Sau
import { EmailProvider } from '~/providers/emailProvider'
await EmailProvider.sendEmail({ to, subject, html })
```

### Cách 2: Chỉnh trực tiếp trong `userService.js`

```javascript
// userService.js
import { env } from '~/config/environment'
import { NodeMailerProvider } from '~/providers/NodeMailerProvider'
import { ProMailerProvider } from '~/providers/ProMailerProvider'

const mailProvider = env.USE_PROMAILER ? ProMailerProvider : NodeMailerProvider

// ...
await mailProvider.sendEmail({
  to: getNewUser.email,
  subject: customSubject,
  html: customHtmlContent
})
```

---

## 6. Ví dụ cấu hình Render

Trên [Render Dashboard](https://dashboard.render.com/):

1. Chọn service (Backend)
2. Vào **Environment** → **Environment Variables**
3. Thêm:

| Key | Value |
|-----|-------|
| `USE_PROMAILER` | `true` |
| `PROMAILER_API_KEY` | `<API key từ ProMailer>` |
| `PROMAILER_SMTP_ID` | `<SMTP Connection ID>` |
| `EMAIL_FROM_ADDRESS` | `your@gmail.com` |
| `EMAIL_FROM_NAME` | `Trello Service` |

4. Save và redeploy

---

## 7. Cấu hình SMTP trong ProMailer (Gmail ví dụ)

Khi thêm SMTP connection trên ProMailer:

| Trường | Gmail SSL (465) | Gmail STARTTLS (587) |
|--------|------------------|-----------------------|
| Host | smtp.gmail.com | smtp.gmail.com |
| Port | 465 | 587 |
| Username | your@gmail.com | your@gmail.com |
| Password | App Password | App Password |
| TLS | Bật | Bật |
| SSL | Bật (port 465) | Tắt (port 587) |

**Gmail App Password:**  
Tạo tại [https://myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords) (cần bật 2FA).

---

## 8. API ProMailer tham chiếu

**Base URL:** `https://mailserver.automationlounge.com`  
**Endpoint:** `POST /api/v1/messages/send`

**Headers:**
```
Authorization: Bearer <YOUR_API_KEY>
Content-Type: application/json
```

**Body:**
```json
{
  "to": "recipient@example.com",
  "subject": "Tiêu đề email",
  "html": "<h1>Nội dung HTML</h1>",
  "text": "Nội dung plain text (tùy chọn)",
  "from": "optional-custom-sender@example.com",
  "smtpId": "smtp_connection_id"
}
```
*(`to` là string; `smtpId`, `from`, `text` là optional)*

---

## 9. Troubleshooting

### Lỗi 401 Unauthorized
- Kiểm tra `PROMAILER_API_KEY` đúng và chưa hết hạn
- API key phải truyền trong header: `Authorization: Bearer <key>`

### Lỗi 400 Bad Request
- Kiểm tra `smtpId` (SMTP Connection ID) có tồn tại
- `to` phải là mảng email hợp lệ

### Email không gửi được
- Kiểm tra SMTP trong ProMailer dashboard
- Gmail: dùng App Password, không dùng mật khẩu đăng nhập
- Kiểm tra log trong ProMailer (nếu có)

### Lỗi 405 Method Not Allowed
- Endpoint đúng: `POST /api/v1/messages/send` (không phải `/api/send` hay `/api/v1/smtp/send`)
- Base URL: `https://mailserver.automationlounge.com`

### Local chạy được, Render không
- Đảm bảo `USE_PROMAILER=true` trên Render
- Kiểm tra env variables đã được lưu và áp dụng
- Redeploy sau khi sửa env

---

## 10. Tóm tắt nhanh

1. Đăng ký [ProMailer](https://www.promailer.xyz/) và tạo SMTP connection.
2. Tạo API key và lấy `smtpId`.
3. Thêm biến môi trường `PROMAILER_API_KEY`, `PROMAILER_SMTP_ID`, `USE_PROMAILER=true` trên Render.
4. Tạo `ProMailerProvider` gọi `POST /api/send`.
5. Chọn provider theo `USE_PROMAILER`: Render dùng ProMailer, local có thể dùng NodeMailer.

---

## 11. Tài liệu và video

- [ProMailer Documentation](https://www.promailer.xyz/documentation)
- [ProMailer - Trang chủ](https://www.promailer.xyz/)
- [Video: Fix Render SMTP Problem – ProMailer](https://www.youtube.com/watch?v=gdYA1nTRbzQ) (I-Tech Academy)
- [Render – SMTP ports blocked](https://community.render.com/t/outbound-smtp-connection-timeout-on-free-tier/39168)

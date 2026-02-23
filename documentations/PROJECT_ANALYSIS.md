# Phân Tích Tổng Hợp Dự Án Trello API

> Tài liệu phân tích toàn diện về Backend API Trello - Dự án từ kênh YouTube TrungQuanDev (MERN Stack Pro Course)

---

## 1. TỔNG QUAN DỰ ÁN

### 1.1 Mục đích
- **trello-api** là Backend API cho ứng dụng quản lý công việc kiểu Trello
- Phục vụ khóa học Full Stack MERN Pro trên YouTube
- Tích hợp với Frontend Vercel: `trello-web-henna-eta.vercel.app`

### 1.2 Thông tin kỹ thuật
| Thông tin | Chi tiết |
|-----------|----------|
| **Tên package** | nodejs-expressjs-mongodb-base-project |
| **Node.js** | >= 18.x |
| **Stack** | Node.js, Express.js, MongoDB (native driver) |
| **Tác giả** | TrungQuanDev |
| **Demo account** | Email: kayfftheodd@gmail.com, Password: 12345678a |

---

## 2. CẤU TRÚC DỰ ÁN

```
trello-api/
├── .cursor/                    # Cursor IDE rules
├── .env.example                # Mẫu biến môi trường
├── .babelrc                    # Cấu hình Babel
├── .eslintrc.cjs               # Cấu hình ESLint
├── jsconfig.json               # Path alias: ~/* → ./src/*
├── package.json
├── README.md
├── yarn.lock
├── documentations/             # Tài liệu dự án
│   └── PROJECT_ANALYSIS.md
└── src/
    ├── server.js               # Entry point chính
    ├── config/                 # Cấu hình
    │   ├── cors.js
    │   ├── environment.js
    │   └── mongodb.js
    ├── controllers/            # Xử lý request/response
    ├── middlewares/            # Middleware (auth, error, upload)
    ├── models/                 # MongoDB models (Joi schema)
    ├── providers/              # JWT, Email, Cloudinary
    ├── routes/v1/              # API routes version 1
    ├── services/               # Business logic
    ├── sockets/                # Socket.IO real-time
    ├── utils/                  # Hàm tiện ích, constants
    └── validations/            # Joi validation rules
```

---

## 3. KIẾN TRÚC HỆ THỐNG

### 3.1 Kiến trúc phân lớp (Layered Architecture)

```
Request → Routes → Middlewares → Controllers → Services → Models → MongoDB
                ↓
         Validations (Joi)
         Auth (JWT từ cookies)
         File Upload (Multer)
```

### 3.2 Luồng xử lý
1. **Routes** (`/v1/*`) nhận request
2. **Middlewares**: kiểm tra JWT (accessToken trong cookies), validate body, upload file
3. **Controllers**: điều phối logic, gọi Services
4. **Services**: business logic, gọi Models
5. **Models**: thao tác trực tiếp MongoDB qua native driver
6. **Response** trả về JSON

### 3.3 Path Alias
- `~/` = `./src/` (cấu hình trong `jsconfig.json` và `babel-plugin-module-resolver`)

---

## 4. CƠ SỞ DỮ LIỆU (MongoDB)

### 4.1 Collections & Schemas

| Collection | Mô tả | Các trường chính |
|------------|-------|------------------|
| **boards** | Bảng Kanban | `title`, `slug`, `description`, `type` (public/private), `columnOrderIds`, `ownerIds`, `memberIds`, `createAt`, `updateAt`, `_destroy` |
| **columns** | Cột trong board | `boardId`, `title`, `cardOrderIds`, `createdAt`, `updatedAt`, `_destroy` |
| **cards** | Thẻ công việc | `boardId`, `columnId`, `title`, `description`, `cover`, `memberIds`, `comments[]`, `createdAt`, `updatedAt`, `_destroy` |
| **users** | Người dùng | `email`, `password`, `userName`, `displayName`, `avatar`, `role` (client/admin), `isActive`, `verifyToken`, `createAt`, `updateAt`, `_destroy` |
| **invitations** | Lời mời vào board | `inviterId`, `inviteeId`, `type`, `boardInvitation: { boardId, status }`, `createdAt`, `updatedAt`, `_destroy` |

### 4.2 Quan hệ dữ liệu
- **Board** ↔ **Column**: một-nhiều qua `columnOrderIds`
- **Column** ↔ **Card**: một-nhiều qua `cardOrderIds`
- **Board** ↔ **User**: nhiều-nhiều qua `ownerIds`, `memberIds`
- **Card** ↔ **User**: nhiều-nhiều qua `memberIds`
- **Card**: nhúng `comments` (embedded array)
- **Invitation** liên kết User (inviter, invitee) và Board

### 4.3 Soft delete
- Mọi collection dùng `_destroy: boolean` để đánh dấu xóa mềm

---

## 5. API ENDPOINTS

### Base URL: `/v1`

#### 5.1 Health Check
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/v1/status` | Kiểm tra API sẵn sàng |

#### 5.2 User APIs (`/v1/users`)
| Method | Endpoint | Auth | Mô tả |
|--------|----------|------|-------|
| POST | `/v1/users/register` | ❌ | Đăng ký tài khoản |
| PUT | `/v1/users/verify` | ❌ | Xác thực tài khoản |
| POST | `/v1/users/login` | ❌ | Đăng nhập |
| DELETE | `/v1/users/logout` | ❌ | Đăng xuất |
| GET | `/v1/users/refresh_token` | ❌ | Làm mới access token |
| PUT | `/v1/users/update` | ✅ | Cập nhật thông tin (avatar upload) |

#### 5.3 Board APIs (`/v1/boards`)
| Method | Endpoint | Auth | Mô tả |
|--------|----------|------|-------|
| GET | `/v1/boards` | ✅ | Danh sách boards (phân trang, search) |
| POST | `/v1/boards` | ✅ | Tạo board mới |
| GET | `/v1/boards/:id` | ✅ | Chi tiết board (aggregate columns, cards) |
| PUT | `/v1/boards/:id` | ✅ | Cập nhật board |
| PUT | `/v1/boards/supports/moving_card` | ✅ | Di chuyển card giữa các column |

#### 5.4 Column APIs (`/v1/columns`)
| Method | Endpoint | Auth | Mô tả |
|--------|----------|------|-------|
| POST | `/v1/columns` | ✅ | Tạo column mới |
| PUT | `/v1/columns/:id` | ✅ | Cập nhật column (kể cả `cardOrderIds`) |
| DELETE | `/v1/columns/:id` | ✅ | Xóa column (soft delete) |

#### 5.5 Card APIs (`/v1/cards`)
| Method | Endpoint | Auth | Mô tả |
|--------|----------|------|-------|
| POST | `/v1/cards` | ✅ | Tạo card mới |
| PUT | `/v1/cards/:id` | ✅ | Cập nhật card (có upload cover) |

#### 5.6 Invitation APIs (`/v1/invitations`)
| Method | Endpoint | Auth | Mô tả |
|--------|----------|------|-------|
| POST | `/v1/invitations/board` | ✅ | Gửi lời mời vào board |
| GET | `/v1/invitations` | ✅ | Lấy danh sách lời mời |
| PUT | `/v1/invitations/board/:invitationId` | ✅ | Cập nhật trạng thái lời mời (ACCEPT/REJECT) |

---

## 6. XÁC THỰC & BẢO MẬT

### 6.1 JWT (JSON Web Token)
- **Access Token**: lưu trong **HttpOnly Cookie** (`accessToken`)
- **Refresh Token**: dùng để lấy access token mới khi hết hạn
- Middleware `authMiddleware.isAuthorized`: đọc `req.cookies.accessToken`, verify JWT
- Nếu token hết hạn: trả về `410 Gone` → FE gọi `refresh_token`
- Nếu token không hợp lệ: trả về `401 Unauthorized` → FE gọi logout

### 6.2 CORS
- **Dev**: cho phép mọi origin (Postman, localhost)
- **Production**: chỉ cho phép domain trong `WHITELIST_DOMAINS`:
  - `https://trello-web-henna-eta.vercel.app`
  - `https://trello-7u9iahxmd-kayffs-projects.vercel.app`
- `credentials: true` để nhận cookies

### 6.3 Validation
- Joi schema trong Models và riêng trong `validations/`
- ObjectId validation qua `OBJECT_ID_RULE`, `EMAIL_RULE`

---

## 7. CÁC PROVIDER DỊCH VỤ

| Provider | Chức năng |
|----------|-----------|
| **JwtProvider** | `generateToken()`, `verifyToken()` |
| **BrevoProvider** | Gửi email qua Brevo API |
| **ResendProvider** | Gửi email qua Resend |
| **NodeMailerProvider** | Gửi email SMTP |
| **CloudinaryProvider** | Upload ảnh (avatar, card cover) |

---

## 8. REAL-TIME (Socket.IO)

### 8.1 Cấu hình
- Socket.IO gắn trên HTTP server (cùng server với Express)
- CORS dùng chung config với Express

### 8.2 Sự kiện
| Event | Chiều | Mô tả |
|-------|-------|-------|
| `FE_USER_INVITED_TO_BOARD` | Client → Server | Client gửi thông tin invitation |
| `FE_USER_INVITED_TO_BOARD` | Server → Clients | Server broadcast đến các client khác (người được mời) |

---

## 9. XỬ LÝ LỖI

### 9.1 ApiError
- Class kế thừa `Error`, có `statusCode`, `message`, `stack`
- Dùng `next(new ApiError(statusCode, message))`

### 9.2 errorHandlingMiddleware
- Nhận lỗi từ `next(err)`
- Trả JSON: `{ statusCode, message, stack? }`
- Môi trường production: ẩn `stack`

---

## 10. BIẾN MÔI TRƯỜNG (.env)

| Biến | Mô tả |
|------|-------|
| `MONGODB_URI`, `DATABASE_NAME` | Kết nối MongoDB Atlas |
| `LOCAL_DEV_APP_HOST`, `LOCAL_DEV_APP_PORT` | Chạy local |
| `AUTHOR` | Tên hiển thị trong log |
| `WEBSITE_DOMAIN_DEVELOPMENT`, `WEBSITE_DOMAIN_PRODUCTION` | Domain frontend |
| `BREVO_API_KEY`, `ADMIN_EMAIL_*` | Brevo email |
| `RESEND_API_KEY`, `ADMIN_SENDER_EMAIL` | Resend email |
| `EMAIL_USER`, `EMAIL_PASS`, `EMAIL_HOST`, ... | Nodemailer SMTP |
| `ACCESS_TOKEN_SECRET_SIGNATURE`, `ACCESS_TOKEN_LIFE` | JWT access |
| `REFRESH_TOKEN_SECRET_SIGNATURE`, `REFRESH_TOKEN_LIFE` | JWT refresh |
| `CLOUDINARY_*` | Cloudinary upload |

---

## 11. SCRIPTS NPM

| Script | Lệnh | Mô tả |
|--------|------|-------|
| `dev` | `nodemon --exec babel-node ./src/server.js` | Chạy dev với hot-reload |
| `production` | Build Babel + `node ./build/src/server.js` | Chạy production |
| `build` | Babel compile `src` → `build` | Build project |
| `lint` | ESLint trên `src` | Kiểm tra code |

---

## 12. CONSTANTS QUAN TRỌNG

| Constant | Giá trị |
|----------|---------|
| `BOARD_TYPES` | `PUBLIC`, `PRIVATE` |
| `INVITATION_TYPES` | `BOARD_INVITATION` |
| `BOARD_INVITATION_STATUS` | `PENDING`, `ACCEPTED`, `REJECTED` |
| `CARD_MEMBER_ACTIONS` | `ADD`, `REMOVE` |
| `USER_ROLES` | `client`, `admin` |
| `DEFAULT_PAGE` | 1 |
| `DEFAULT_ITEMS_PER_PAGE` | 12 |

---

## 13. LƯU Ý KỸ THUẬT

1. **Không dùng Mongoose**: dùng MongoDB native driver
2. **Babel**: ES6+ → ES5, path alias `~`
3. **Soft delete**: dùng `_destroy` thay vì xóa vật lý
4. **Aggregation**: dùng `$lookup` để join collections (board details, invitations)
5. **Phân trang**: `$facet` để vừa query vừa đếm tổng
6. **File upload**: Multer (memory) + Cloudinary (streamifier)
7. **Graceful shutdown**: `async-exit-hook` đóng DB trước khi thoát

---

## 14. TÀI LIỆU THAM KHẢO

- YouTube: [TrungQuanDev - MERN Stack Pro](https://youtube.com/@trungquandev)
- MongoDB Aggregation, Joi validation, JWT, Socket.IO, CORS
- Deploy: Render.com (production), Vercel (frontend)

---

*Tài liệu được tạo tự động từ phân tích codebase - Cập nhật: Tháng 2, 2025*

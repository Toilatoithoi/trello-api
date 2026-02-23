# Progress: trello-api

## What Works

- [x] User: register, login, verify, refresh token, logout, update (avatar)
- [x] Board: CRUD, phân trang, search, move card giữa columns
- [x] Column: CRUD, soft delete
- [x] Card: CRUD, cover upload, comments (embedded), members
- [x] Invitation: gửi lời mời, xem danh sách, accept/reject
- [x] Auth: JWT trong HttpOnly cookie, authMiddleware
- [x] Socket.IO: broadcast invitation event `FE_USER_INVITED_TO_BOARD`
- [x] CORS, error handling, Multer + Cloudinary
- [x] Deploy: Backend (Render), Frontend (Vercel)

## What's Left

- [ ] API v2 (placeholder có sẵn tại `src/routes/v2/index.js`)
- [ ] Có thể mở rộng: rate limiting, caching, WebSocket rooms/namespaces
- [ ] Tùy chọn: migration sang TypeScript, thêm test (Jest, Supertest)

## Known Issues

- File socket: import từ `inviteUserToSocket` (không phải `inviteUserToBoardSocket` filename)
- Column model: typo `createAt` trong INVALID_UPDATE_FIELDS (DB dùng `createdAt`)
- Có thể chuẩn hóa thêm: naming thống nhất `createAt` vs `createdAt` trong board/column/card

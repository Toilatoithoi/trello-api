# Product Context: trello-api

## Why This Project Exists

- Cung cấp API backend cho ứng dụng quản lý công việc kiểu Trello
- Phục vụ mục đích học tập trong khóa MERN Stack Pro (YouTube)
- Demo chuẩn kiến trúc Layered: Routes → Controllers → Services → Models

## Problems Solved

- Xác thực an toàn (JWT trong HttpOnly cookie, refresh token)
- Quản lý boards/columns/cards với soft delete
- Mời thành viên vào board và real-time thông báo
- Upload ảnh (avatar, card cover) qua Cloudinary
- Gửi email (xác thực tài khoản) qua Brevo, Resend hoặc Nodemailer

## API Goals

- RESTful design, versioned `/v1`
- Response chuẩn JSON, xử lý lỗi tập trung (ApiError + errorHandlingMiddleware)
- CORS rõ ràng: dev mở, production whitelist domain
- Tài liệu tham chiếu: `documentations/PROJECT_ANALYSIS.md`

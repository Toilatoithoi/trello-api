# Project Brief: trello-api

## Overview

**trello-api** là Backend API cho ứng dụng quản lý công việc kiểu Trello (Kanban). Dự án phục vụ khóa học Full Stack MERN Pro trên YouTube (TrungQuanDev) và tích hợp với Frontend deploy trên Vercel.

## Core Features

- **User**: Đăng ký, đăng nhập, xác thực email, JWT (access + refresh token), cập nhật profile/avatar
- **Board**: CRUD, public/private, phân trang, tìm kiếm, owner/member
- **Column**: CRUD, thứ tự cột, soft delete
- **Card**: CRUD, cover upload, members, comments (embedded)
- **Invitation**: Mời user vào board, chấp nhận/từ chối
- **Real-time**: Socket.IO cho thông báo invitation

## Target Users

- Học viên MERN Stack Pro (học tập, demo)
- Developer tham khảo kiến trúc Backend Node/Express
- Frontend app Trello-like cần REST API + Socket.IO

## Tech Stack (tóm tắt)

- Node.js ≥ 18, Express.js, MongoDB (native driver, không Mongoose)
- JWT, Joi validation, Multer + Cloudinary, Brevo/Resend/Nodemailer, Socket.IO

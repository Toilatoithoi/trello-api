# System Patterns: trello-api

## Architecture

**Layered Architecture:**

```
Request → Routes → Middlewares → Controllers → Services → Models → MongoDB
                ↓
         - Validations (Joi)
         - Auth (JWT from cookies)
         - File Upload (Multer)
```

## Conventions

- **Naming**: PascalCase cho class/export, camelCase cho function/variable
- **Collections**: snake_case cho DB fields (e.g. `columnOrderIds`, `ownerIds`)
- **Models**: `createNew`, `findOneById`, `update`, `validateBeforeCreate`
- **INVALID_UPDATE_FIELDS**: Loại trừ `_id`, `createAt`, … khi update
- **Soft delete**: `_destroy: boolean` thay vì xóa vật lý

## Patterns in Use

1. **MongoDB native driver**: Không dùng Mongoose
2. **Joi schema**: Trong model và file validation riêng
3. **Aggregation**: `$lookup` cho board details, invitations (join)
4. **Phân trang**: `$facet` để query + count tổng
5. **Error handling**: `ApiError` + `errorHandlingMiddleware`
6. **JWT**: Access token trong cookie, 410 khi expired → FE gọi refresh
7. **CORS**: Dev mở tất cả, Production whitelist domain
8. **Graceful shutdown**: `async-exit-hook` đóng DB trước khi thoát

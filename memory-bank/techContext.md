# Tech Context: trello-api

## Stack

| Layer | Technology |
|-------|------------|
| Runtime | Node.js ≥ 18 |
| Framework | Express.js |
| Database | MongoDB Atlas (native driver) |
| Auth | JWT (jsonwebtoken), bcryptjs |
| Validation | Joi |
| File Upload | Multer + Cloudinary + streamifier |
| Email | Brevo, Resend, Nodemailer |
| Real-time | Socket.IO |
| Build/Dev | Babel, nodemon, ESLint |

## Key Paths

- **Entry**: `src/server.js`
- **Routes**: `src/routes/v1/` (boards, columns, cards, users, invitations)
- **Controllers**: `src/controllers/`
- **Services**: `src/services/`
- **Models**: `src/models/` (boards, columns, cards, users, invitations)
- **Validations**: `src/validations/`
- **Middlewares**: `src/middlewares/` (auth, errorHandling, multerUpload)
- **Providers**: `src/providers/` (Jwt, Brevo, Resend, NodeMailer, Cloudinary)
- **Config**: `src/config/` (cors, environment, mongodb)
- **Utils**: `src/utils/` (ApiError, constants, validators, algorithms, formatters, sorts)

## Path Alias

- `~/` → `./src/` (jsconfig.json, babel-plugin-module-resolver)

## Scripts

- `npm run dev` – Chạy dev (nodemon + babel-node)
- `npm run production` – Build + chạy production
- `npm run build` – Babel compile src → build
- `npm run lint` – ESLint

## Environment Variables

- MongoDB: `MONGODB_URI`, `DATABASE_NAME`
- App: `LOCAL_DEV_APP_HOST`, `LOCAL_DEV_APP_PORT`, `AUTHOR`
- Domains: `WEBSITE_DOMAIN_DEVELOPMENT`, `WEBSITE_DOMAIN_PRODUCTION`
- JWT: `ACCESS_TOKEN_SECRET_SIGNATURE`, `ACCESS_TOKEN_LIFE`, `REFRESH_TOKEN_*`
- Email: Brevo, Resend, Nodemailer keys
- Cloudinary: `CLOUDINARY_*`

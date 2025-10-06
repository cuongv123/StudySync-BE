# 📚 StudySync Backend API

<p align="center">
  <img src="https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white" alt="NestJS" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase" />
</p>

## 🎯 Tổng quan

**StudySync** là một nền tảng học tập nhóm hiện đại, cho phép sinh viên tạo và tham gia các nhóm học tập, chia sẻ kiến thức và cùng nhau phát triển. Hệ thống được xây dựng với NestJS, TypeScript và PostgreSQL.

### ✨ Tính năng chính

- 🔐 **Xác thực & Phân quyền**: Đăng ký, đăng nhập với JWT và OTP verification
- 👥 **Quản lý nhóm học tập**: Tạo, tham gia và quản lý nhóm học tập
- 📧 **Mời thành viên**: Gửi lời mời qua email với hệ thống thông báo
- 💬 **Chat realtime**: Trò chuyện trong nhóm với WebSocket
- 🎥 **Video meeting**: Họp nhóm tích hợp Azure/AWS
- 🔔 **Thông báo realtime**: Cập nhật tin tức nhóm ngay lập tức
- 📊 **Dashboard quản lý**: Theo dõi hoạt động và thống kê

## 🚀 Bắt đầu nhanh

### Yêu cầu hệ thống

- Node.js ≥ 18.0.0
- npm ≥ 8.0.0
- PostgreSQL ≥ 14

### Cài đặt

```bash
# Clone repository
git clone https://github.com/cuongv123/StudySync-BE.git
cd StudySync-BE

# Cài đặt dependencies
npm install

# Cấu hình môi trường
cp .env.example .env
```

### Cấu hình môi trường (.env)

```env
# App Configuration
PORT=3000
NODE_ENV=development

# Database (Supabase)
DATABASE_URL=postgresql://user:password@host:port/database

# JWT Authentication
JWT_SECRET=your_super_secret_key
JWT_EXPIRES_IN=1d

# Email Service
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your_email@gmail.com
MAIL_PASSWORD=your_app_password
MAIL_FROM=noreply@studysync.com

# Frontend URL
FRONTEND_URL=http://localhost:3000

# OTP Configuration
OTP_EXPIRY_MINUTES=15

# Swagger Documentation
SWAGGER_USER=admin
SWAGGER_PASSWORD=admin123
```

### Chạy ứng dụng

```bash
# Development
npm run start:dev

# Production
npm run build
npm run start:prod

# Migration
npm run migration:run
```

## 📖 API Documentation

API Documentation có sẵn tại: `http://localhost:3000/api-docs`

### Endpoints chính

#### 🔐 Authentication
- `POST /api/v1/auth/register` - Đăng ký tài khoản
- `POST /api/v1/auth/login` - Đăng nhập
- `POST /api/v1/auth/verify-email` - Xác thực email
- `POST /api/v1/auth/forgot-password` - Quên mật khẩu
- `POST /api/v1/auth/refresh` - Refresh token

#### 👥 Study Groups
- `GET /api/v1/groups` - Lấy danh sách nhóm của user
- `POST /api/v1/groups` - Tạo nhóm mới
- `GET /api/v1/groups/:id` - Chi tiết nhóm
- `POST /api/v1/groups/:id/invite` - Mời thành viên
- `POST /api/v1/groups/invite/:inviteId/accept` - Chấp nhận lời mời

#### 👤 User Management
- `GET /api/v1/users/me` - Thông tin user hiện tại
- `PATCH /api/v1/users/me/password` - Đổi mật khẩu

#### 🛡️ Admin
- `GET /api/v1/admin` - Danh sách users (Admin only)
- `DELETE /api/v1/admin/:id` - Xóa user (Admin only)

## 🗄️ Cấu trúc Database

### Bảng chính

#### `users`
- Thông tin người dùng, authentication
- Roles: `USER`, `ADMIN`
- Email verification với OTP

#### `study_groups`
- Thông tin nhóm học tập
- Người tạo (creator) và thành viên

#### `group_members`
- Quan hệ nhiều-nhiều giữa users và groups
- Status: `pending`, `accepted`, `rejected`
- Role: `admin`, `member`

#### `group_invites`
- Lời mời tham gia nhóm qua email
- Trạng thái theo dõi lời mời

#### `tokens`
- Quản lý JWT tokens và refresh tokens

## 🏗️ Kiến trúc hệ thống

```
src/
├── module/
│   ├── auth/           # Authentication & Authorization
│   ├── User/           # User management
│   ├── study-group/    # Study group functionality
│   ├── mail/           # Email service
│   └── token/          # Token management
├── common/
│   ├── enums/          # Enumerations
│   ├── filters/        # Exception filters
│   └── interceptors/   # Request/Response interceptors
├── configs/            # Configuration files
├── Database/
│   ├── migrations/     # Database migrations
│   └── data-source.ts  # TypeORM configuration
└── decorator/          # Custom decorators
```

## 🔧 Scripts hữu ích

```bash
# Development
npm run start:dev        # Chạy dev server với hot reload
npm run build           # Build production
npm run start:prod      # Chạy production server

# Database
npm run migration:generate  # Tạo migration mới
npm run migration:run      # Chạy migrations
npm run migration:revert   # Rollback migration

# Testing
npm run test           # Unit tests
npm run test:e2e       # End-to-end tests
npm run test:cov       # Test coverage

# Code Quality
npm run lint           # ESLint
npm run format         # Prettier formatting
```

## 🚀 Deployment

### Supabase Database
1. Tạo project trên [Supabase](https://supabase.com)
2. Copy connection string vào `DATABASE_URL`
3. Chạy migrations: `npm run migration:run`

### Production Server
```bash
# Build application
npm run build

# Start production server
npm run start:prod

# PM2 (recommended)
npm install -g pm2
pm2 start dist/main.js --name studysync-api
pm2 save
pm2 startup
```

## 🛠️ Tech Stack

- **Framework**: NestJS 11.x
- **Language**: TypeScript
- **Database**: PostgreSQL (Supabase)
- **ORM**: TypeORM
- **Authentication**: JWT + Passport
- **Email**: Nodemailer + Gmail SMTP
- **Documentation**: Swagger/OpenAPI
- **Validation**: class-validator
- **Testing**: Jest

## 🤝 Đóng góp

1. Fork repository
2. Tạo feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Tạo Pull Request

## 📝 Roadmap

- [ ] 💬 **Chat realtime** với WebSocket
- [ ] 🎥 **Video meeting** integration
- [ ] 🔔 **Push notifications**
- [ ] 📊 **Analytics dashboard**
- [ ] 🌐 **Multi-language support**
- [ ] 📱 **Mobile app API**
- [ ] 🔍 **Advanced search & filters**
- [ ] 🎨 **Themes & customization**

## 📄 License

Dự án này được phân phối dưới giấy phép [MIT License](LICENSE).

## 📞 Liên hệ

- Email: support@studysync.com
- Website: https://studysync.com
- StudySync BackEnd Team

---

<p align="center">
  Made with ❤️ for the student community
</p>
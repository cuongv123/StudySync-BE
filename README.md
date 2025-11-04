# 📚 StudySync Backend API

<p align="center">
  <img src="https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white" alt="NestJS" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase" />
  <img src="https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socket.io&logoColor=white" alt="Socket.io" />
</p>

<p align="center">
  <a href="https://studysync-be.onrender.com/api-docs">📖 API Documentation</a> •
  <a href="https://studysync.id.vn">🌐 Live Demo</a>
</p>

---

## 🎯 Tổng quan

**StudySync** là nền tảng học tập nhóm thông minh dành cho sinh viên Việt Nam, giúp tổ chức học nhóm hiệu quả với các công cụ hiện đại như chat realtime, video call, file sharing và AI chatbot hỗ trợ học tập 24/7.

### ✨ Tính năng chính

#### 🔐 **Authentication & Authorization**
- Đăng ký/Đăng nhập với JWT tokens
- Email verification với OTP (6 chữ số)
- Forgot password & reset password
- Role-based access control (USER, ADMIN)
- Refresh token rotation

#### 👥 **Study Groups Management**
- Tạo và quản lý nhóm học tập không giới hạn
- Invite members qua email
- Join/Leave group
- Transfer leadership
- Member management (kick, assign roles)
- Group settings & privacy

#### 💬 **Real-time Chat**
- Chat realtime với WebSocket (Socket.io)
- Group chat với typing indicators
- Message history & pagination
- Edit/Delete messages
- File/Image sharing trong chat

#### 🎥 **Video Call**
- Video call HD với WebRTC
- Screen sharing để thuyết trình
- Recording (Pro Max plan)
- Call history & statistics

#### 📁 **File Management**
- Personal storage: 100MB (Free) → 5GB (Pro Max)
- Group storage với shared access
- Upload/Download files
- Folder structure
- Storage quota tracking

#### ✅ **Task Management**
- Tạo và assign tasks cho members
- Set deadline & priority
- Track progress (TODO, IN_PROGRESS, DONE)
- Task notifications

#### 🤖 **AI Chatbot**
- Gemini AI integration
- System prompt với knowledge base riêng về StudySync
- Usage limit theo subscription plan
- Chat history

#### 💳 **Subscription & Payment**
- 3 gói: Free, Pro (49k), Pro Max (99k)
- PayOS integration (QR Banking)
- Webhook auto-activation
- Payment history

#### 🔔 **Notifications**
- Realtime notifications qua WebSocket
- 12 loại thông báo (invite, message, leadership...)
- Read/Unread tracking
- Push notifications

#### 👨‍💼 **Admin Dashboard**
- User management (CRUD)
- Revenue & subscription statistics
- System monitoring
- Admin-only APIs

---

## 🚀 Quick Start

### Prerequisites

- Node.js ≥ 18.0.0
- npm ≥ 8.0.0
- PostgreSQL ≥ 14

### Installation

```bash
# Clone repository
git clone https://github.com/cuongv123/StudySync-BE.git
cd StudySync-BE

# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with your configuration
```

### Environment Variables

```env
# App Configuration
PORT=3000
NODE_ENV=development
APP_URL=https://studysync-be.onrender.com

# Database (Supabase PostgreSQL)
DATABASE_URL=postgresql://user:password@host:port/database
DB_HOST=aws-0-ap-southeast-1.pooler.supabase.com
DB_PORT=6543
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_NAME=postgres

# JWT Authentication
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=1d
REFRESH_TOKEN_SECRET=your_refresh_token_secret
REFRESH_TOKEN_EXPIRES_IN=7d

# Email Service (Gmail SMTP)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your_email@gmail.com
MAIL_PASSWORD=your_app_password
MAIL_FROM=StudySync <noreply@studysync.com>

# OTP Configuration
OTP_EXPIRY_MINUTES=15

# PayOS Payment Gateway
PAYOS_CLIENT_ID=your_client_id
PAYOS_API_KEY=your_api_key
PAYOS_CHECKSUM_KEY=your_checksum_key

# Gemini AI
GEMINI_API_KEY=your_gemini_api_key

# CORS
FRONTEND_URL=https://studysync.id.vn

# Swagger
SWAGGER_USER=admin
SWAGGER_PASSWORD=admin123
```

### Database Setup

```bash
# Run migrations
npm run migration:run

# Generate migration
npm run migration:generate -- src/Database/migrations/MigrationName

# Revert migration
npm run migration:revert
```

### Run Application

```bash
# Development (hot reload)
npm run start:dev

# Production build
npm run build
npm run start:prod

# Debug mode
npm run start:debug
```

### Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

---

## 📖 API Documentation

### 🌐 Swagger UI
- **Local:** http://localhost:3000/api-docs
- **Production:** https://studysync-be.onrender.com/api-docs

### 📋 API Endpoints Summary

| Module | Endpoints | Description |
|--------|-----------|-------------|
| **Auth** | 8 endpoints | Register, Login, OTP, Password reset |
| **Groups** | 12 endpoints | CRUD groups, members, invitations |
| **Chat** | 5 endpoints + WebSocket | Realtime messaging |
| **Files** | 6 endpoints | Upload, download, folders |
| **Tasks** | 7 endpoints | Task management |
| **Video Call** | 5 endpoints + WebSocket | Video conferencing |
| **Payment** | 6 endpoints | PayOS integration |
| **AI Chat** | 6 endpoints | Gemini AI chatbot |
| **Notifications** | 8 endpoints + WebSocket | Realtime notifications |
| **Admin** | 9 endpoints | Admin dashboard |
| **Users** | 3 endpoints | User profile |

**Total:** 75+ REST endpoints + WebSocket events

---

## 🗄️ Database Schema

### Key Tables

```sql
users                      # 11 columns
study_groups              # 10 columns
group_members             # 6 columns
group_invitations         # 8 columns
messages                  # 8 columns
files                     # 14 columns
tasks                     # 11 columns
video_calls               # 9 columns
call_participants         # 7 columns
subscription_plans        # 9 columns
user_subscriptions        # 12 columns
payments                  # 13 columns
notifications             # 9 columns
ai_query_history          # 5 columns
user_storage              # 4 columns
group_storage             # 4 columns
tokens                    # 6 columns
```

**Relationships:**
- Users → Groups (many-to-many via group_members)
- Groups → Messages (one-to-many)
- Groups → Files (one-to-many)
- Groups → Tasks (one-to-many)
- Users → Subscriptions → Plans
- Users → Payments
- Users → Notifications

---

## 🏗️ Tech Stack

### Backend
- **Framework:** NestJS v11.x
- **Language:** TypeScript v5.x
- **Runtime:** Node.js v18+

### Database
- **Primary:** PostgreSQL v14+ (Supabase)
- **ORM:** TypeORM
- **Caching:** Redis (optional)

### Real-time
- **WebSocket:** Socket.io
- **Video:** WebRTC

### External Services
- **Payment:** PayOS (QR Banking)
- **AI:** Google Gemini
- **Email:** Nodemailer (Gmail SMTP)
- **Hosting:** Render.com

### Tools
- **API Docs:** Swagger/OpenAPI
- **Testing:** Jest
- **Validation:** class-validator
- **Security:** JWT, bcrypt, CORS

---

## 📁 Project Structure

```
src/
├── main.ts                          # Entry point
├── app.module.ts                    # Root module
├── common/                          # Shared utilities
│   ├── auth/
│   ├── decorators/
│   ├── enums/
│   ├── filters/
│   ├── interceptors/
│   └── interfaces/
├── configs/                         # Configuration
├── Database/                        # Migrations
└── module/                          # Features
    ├── auth/
    ├── User/
    ├── admin/
    ├── group/
    ├── chat/
    ├── file/
    ├── task/
    ├── video-call/
    ├── notification/
    ├── subscription/
    ├── payment/
    └── ai-chat/
```

---

## 🔐 Security

✅ JWT with refresh tokens  
✅ Password hashing (bcrypt)  
✅ Email verification (OTP)  
✅ RBAC (Role-Based Access Control)  
✅ CORS configuration  
✅ Request validation  
✅ SQL injection prevention  
✅ XSS protection  
✅ HTTPS only in production  

---

## 🚀 Deployment

### Production (Render.com)

```bash
# Auto-deploy from GitHub (dev branch)
# Manual deploy:
git push origin dev

# Environment: Set all .env vars in Render dashboard
# Build: npm run build
# Start: npm run start:prod
```

### Health Check

```bash
GET https://studysync-be.onrender.com/api/v1/health
```

---

## 🧪 Testing

```bash
# All tests
npm test

# Watch mode
npm run test:watch

# Coverage
npm run test:cov
```

---

## 📊 Monitoring

- Request/Response logging (LoggingInterceptor)
- Error tracking (AllExceptionsFilter)
- Performance metrics
- Database query logging

---

## 🤝 Contributing

1. Fork repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'feat: Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

### Commit Convention

```
feat: New feature
fix: Bug fix
docs: Documentation
style: Formatting
refactor: Code refactoring
test: Add tests
chore: Maintenance
```

---

## 📞 Contact

- **Website:** [studysync.id.vn](https://studysync.id.vn)
- **API Docs:** [studysync-be.onrender.com/api-docs](https://studysync-be.onrender.com/api-docs)
- **GitHub:** [cuongv123/StudySync-BE](https://github.com/cuongv123/StudySync-BE)
- **Email:** cuongshyn2003@gmail.com

---

## 📄 License

MIT License - see LICENSE file

---

## 🙏 Acknowledgments

- NestJS Team
- Supabase
- PayOS
- Google Gemini
- FPT University - EXE201

---

<p align="center">
  Made with ❤️ by StudySync Team
</p>

<p align="center">
  <sub>Built for EXE201 - Software Engineering Project</sub>
</p>

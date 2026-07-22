# 🚀 Epilytix Enterprise Server

An enterprise-grade RESTful API, WebSocket server, and offline-first sync engine built with **NestJS**, **TypeScript**, **MongoDB**, **Redis**, and **Socket.IO**. Designed for high-concurrency CRM pipeline management, real-time executive notifications, role-based security, and dynamic content management.

---

## 📑 Table of Contents

- [Features](#-features)
- [Tech Stack & Architecture](#-tech-stack--architecture)
- [Module Breakdown](#-module-breakdown)
- [Environment Configuration](#-environment-configuration)
- [Getting Started](#-getting-started)
- [API Documentation (Swagger)](#-api-documentation-swagger)
- [Deployment & Docker](#-deployment--docker)
- [Security & Compliance](#-security--compliance)

---

## ✨ Features

- **🔐 Multi-Factor Authentication & Security**:
  - JWT Access & Refresh Token rotation architecture.
  - Two-Factor Authentication (2FA / TOTP) support via `otplib`.
  - Device binding & user-agent hardware fingerprinting.
  - Password recovery via secure email OTP using Resend.
- **💼 CRM Lead Pipeline**:
  - Full lead lifecycle management (`NEW`, `CONTACTED`, `IN_PROGRESS`, `CLOSED_WON`, `CLOSED_LOST`).
  - Lead history activity auditing, lead assignment, and internal note-taking.
  - **OTP-Protected Deletion Workflow**: Prevents accidental or unapproved removal of high-value lead records via dual-approval requests.
  - Automatic lead-to-newsletter email subscription integration.
- **📋 Task & Project Management**:
  - Priority matrix (`HIGH`, `MEDIUM`, `LOW`), task statuses, and privacy controls (`isPrivate`).
  - Direct association with CRM leads and automatic push notification dispatch to assignees.
- **📡 Real-Time & Mobile Notifications**:
  - Scalable Socket.IO WebSocket gateway utilizing a Redis Pub/Sub adapter.
  - Firebase Cloud Messaging (FCM) push notifications dispatched via `firebase-admin`.
- **🔄 Offline-First Sync Engine**:
  - Incremental data pull (`updatedAt > since`) filtered by role-based access rights.
  - Sequential offline change push with versioned conflict resolution (`server-wins` via `syncVersion`).
- **🛡️ Security & Compliance Audit Trail**:
  - Automatic audit logging for sensitive actions (Lead creation/updates/deletions, Task assignments, Auth events) capturing user ID, IP address, and user-agent.
- **🖼️ Media & File Handling**:
  - Cloudinary buffer upload stream with fallback to mock local endpoints during testing.

---

## 🛠️ Tech Stack & Architecture

| Layer | Technology |
| :--- | :--- |
| **Framework** | NestJS v11 + TypeScript v5.7 |
| **Database & ORM** | MongoDB + Mongoose v9 |
| **Real-Time WebSockets** | Socket.IO + `@socket.io/redis-adapter` (Upstash TLS compatible) |
| **Push Notifications** | Firebase Admin SDK (`firebase-admin` v14) |
| **Transactional Email** | Resend API (`resend` v6) |
| **Media Storage** | Cloudinary SDK (`cloudinary` v2) |
| **Rate Limiting** | `@nestjs/throttler` |
| **Middleware & Security** | Helmet, Compression, Cookie Parser, Class Validator |
| **Documentation** | Swagger OpenAPI (`@nestjs/swagger`) |

---

## 🧱 Module Breakdown

```
src/
├── auth/                 # Login, 2FA/TOTP setup & verification, JWT refresh, Password reset OTP
├── users/                # User accounts, CEO/Founder roles, granular permissions, device bindings
├── leads/                # CRM leads management, note-taking, deletion request OTP workflow
├── tasks/                # Internal task assignments, priority matrix, privacy scope
├── notifications/        # Socket.IO WebSocket gateway & Firebase push notification service
├── sync-engine/          # Offline delta pull & sequential push with concurrency conflict handling
├── content-management/   # CMS blocks management for web & mobile clients
├── newsletter/           # Public & internal email subscriptions handling
├── audit-logs/           # System-wide audit log recorder
├── file-upload/          # Cloudinary media upload stream
├── health/               # System diagnostic and health check endpoints
├── common/               # Global filters, interceptors, guards (JWT, Roles), decorators
└── config/               # App, Database, JWT, and Redis configuration loaders
```

---

## ⚙️ Environment Configuration

Create a `.env` file in the root directory based on `.env.example`:

```env
# Server
PORT=4000
NODE_ENV=development
API_PREFIX=api/v1
CORS_ORIGINS=http://localhost:3000,http://localhost:8081

# Database & Cache
MONGODB_URI=mongodb://localhost:27017/epilytix
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Security & JWT
JWT_ACCESS_SECRET=your-super-secret-access-key
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_SECRET=your-super-secret-refresh-key
JWT_REFRESH_EXPIRY=7d

# Resend Email (OTP & Notifications)
RESEND_API_KEY=re_123456789

# Firebase Admin (Mobile Push Notifications)
FIREBASE_PROJECT_ID=epilytixweb
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@epilytixweb.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"

# Cloudinary (Media Uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Rate Limiting
THROTTLE_TTL=60000
THROTTLE_LIMIT=60
```

---

## 🚦 Getting Started

### Prerequisites
- Node.js >= 20.x
- npm >= 10.x
- MongoDB (local or MongoDB Atlas)
- Redis (local or Upstash Redis)

### Installation & Run

```bash
# 1. Install dependencies
npm install

# 2. Start in development watch mode
npm run start:dev

# 3. Build production bundle
npm run build

# 4. Start production server
npm run start:prod
```

---

## 📖 API Documentation (Swagger)

When running locally, interactive OpenAPI documentation is automatically available at:
👉 **`http://localhost:4000/api/v1/docs`**

You can test authentication endpoints, pass Bearer tokens, and inspect response schemas directly from the browser UI.

---

## 🐳 Deployment & Docker

The repository includes a production-ready `Dockerfile` and `docker-compose.yml`:

```bash
# Build and run containers in background
docker compose up -d --build

# View logs
docker compose logs -f
```

---

## 🔒 Security & Compliance

- **Rate Limiting**: Configured globally with `@nestjs/throttler` to mitigate brute-force and DDoS attempts.
- **Strict Data Sanitation**: `ValidationPipe` with `whitelist: true` and `forbidNonWhitelisted: true`.
- **Sensitive Field Filtering**: Schemas automatically scrub `passwordHash`, `refreshTokenHash`, `twoFactorSecret`, and OTP tokens from JSON responses.
- **CORS Protection**: Origin whitelist configured for production environments while permitting native mobile applications.

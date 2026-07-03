# Epilytix Enterprise Ecosystem - Deployment Guide

This guide covers deploying the Epilytix Backend API, the Next.js Frontend Web Application, and the React Native Mobile Application.

## 1. Environment Preparation
Ensure the following infrastructure components are available:
- **MongoDB**: A managed MongoDB cluster (e.g., MongoDB Atlas).
- **Redis**: A managed Redis cluster (e.g., AWS ElastiCache, Upstash).
- **AWS S3**: An S3 bucket for file uploads with appropriate IAM roles/policies.
- **Firebase**: A Firebase project configured for Cloud Messaging (FCM).

### Backend Environment Variables
Create a `.env` file in the `epilytix-server` directory based on the following template:

```env
PORT=3000
NODE_ENV=production

# Database
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/epilytix

# Redis (for caching, socket.io, queues)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# JWT Authentication
JWT_ACCESS_SECRET=your_super_secret_access_key
JWT_REFRESH_SECRET=your_super_secret_refresh_key

# AWS S3 (File Uploads)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_S3_BUCKET_NAME=

# Firebase (Push Notifications)
FIREBASE_PROJECT_ID=
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=
```

---

## 2. Backend Deployment (NestJS)

### Option A: Docker (Recommended)
A `Dockerfile` is provided for containerized deployment.

1. **Build the Image:**
   ```bash
   docker build -t epilytix-server .
   ```
2. **Run the Container:**
   ```bash
   docker run -p 3000:3000 --env-file .env epilytix-server
   ```
3. **Deploy to Cloud Platform:** 
   Push the image to a container registry (ECR, Docker Hub) and deploy to a service like AWS ECS, Google Cloud Run, or a Kubernetes cluster.

### Option B: PM2 (Bare Metal/VM)
1. **Build:** `npm run build`
2. **Start:** `pm2 start dist/main.js --name "epilytix-api"`

---

## 3. Web Frontend Deployment (Next.js)

The Next.js frontend is configured to proxy API requests to the backend.

### Frontend Environment Variables
Create a `.env.production` file in the `Epilytix-client` directory:

```env
# URL of the deployed backend API (no trailing slash)
NEXT_PUBLIC_API_URL=https://api.epilytix.com
```

### Vercel Deployment (Recommended)
1. Push the `Epilytix-client` code to a GitHub repository.
2. Import the project into Vercel.
3. Set the `NEXT_PUBLIC_API_URL` environment variable.
4. Deploy.

---

## 4. Mobile App Deployment (React Native / Expo)

### Configure Environment
In `Epilytix-mobile/src/api/client.ts` and `Epilytix-mobile/src/services/socket.ts`, ensure `BASE_URL` points to the production backend URL (e.g., `https://api.epilytix.com`).

### Build for Stores (EAS Build)
1. Install EAS CLI: `npm install -g eas-cli`
2. Login: `eas login`
3. Configure the project: `eas build:configure`
4. **Android Build:** `eas build -p android --profile production`
5. **iOS Build:** `eas build -p ios --profile production`

Submit the resulting binaries to the App Store and Google Play using `eas submit`.

---

## 5. System Health Check
After deployment, verify the system is operational:
- **Backend Health Check:** `GET https://api.epilytix.com/health` (Should return `{"status": "ok", ...}`)
- **Frontend App:** Visit the deployed frontend domain and verify contact form submission.
- **Mobile App:** Attempt to log in with the CEO credentials.

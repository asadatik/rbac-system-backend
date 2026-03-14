# RBAC Backend - TypeScript Express.js MVC

Production-ready Role-Based Access Control (RBAC) backend with enterprise-grade architecture.

## 🏗️ Architecture

**Clean MVC Structure:**
```
src/
├── controllers/     # HTTP request handlers
├── models/         # Mongoose schemas + TypeScript interfaces
├── services/       # Business logic (PermissionService, AuthService)
├── routes/         # Express route definitions
├── middleware/     # Auth, RBAC, error handling
├── types/          # TypeScript interfaces & types
├── utils/          # Helpers, validators, logger, errors
├── config/         # Database, JWT configuration
└── server.ts       # Express app & server setup
```

## 🚀 Features

✅ **100% TypeScript** - Full type safety with strict mode
✅ **RBAC System** - Admin, Manager, Agent, Customer roles
✅ **JWT Authentication** - Access & refresh tokens (15m / 7d)
✅ **Permission Management** - Dynamic role-based permissions
✅ **Grant Ceiling Enforcement** - Hierarchical permission assignment
✅ **Audit Logging** - Complete action tracking
✅ **Error Handling** - Custom error classes + global error handler
✅ **Input Validation** - Zod schema validation
✅ **Security** - Helmet, CORS, rate limiting, password hashing
✅ **Logging** - Winston logger with file & console transports
✅ **Graceful Shutdown** - SIGTERM/SIGINT handlers

## 🔑 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Environment
```bash
cp .env.example .env
```

Update `.env` with your MongoDB URI and JWT secret:
```env
MONGO_URI=mongodb+srv://user:password@cluster.mongodb.net/rbac_db
JWT_SECRET=your-super-secure-secret-key
PORT=5000
NODE_ENV=development
```

### 3. Run in Development
```bash
npm run dev
```

### 4. Build for Production
```bash
npm run build
npm start
```

## 📚 API Documentation

### Authentication

#### Register User
```
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123",
  "role": "customer"
}
```

#### Login
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123"
}

Response:
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGci...",
    "refreshToken": "eyJhbGci...",
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "email": "user@example.com",
      "role": "customer",
      "permissions": ["dashboard:view", ...]
    }
  },
  "message": "Login successful",
  "timestamp": "2026-03-14T12:00:00.000Z"
}
```

#### Logout
```
POST /api/auth/logout
Authorization: Bearer <accessToken>
```

#### Refresh Token
```
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGci..."
}
```

### User Management

#### Get All Users
```
GET /api/users?limit=50&offset=0
Authorization: Bearer <accessToken>
```
Requires: `users:view` or `users:manage` permission

#### Get User by ID
```
GET /api/users/:userId
Authorization: Bearer <accessToken>
```

#### Update User
```
PUT /api/users/:userId
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "email": "newemail@example.com",
  "role": "manager"
}
```
Requires: `users:manage` permission

#### Suspend User
```
POST /api/users/:userId/suspend
Authorization: Bearer <accessToken>
```
Requires: `users:manage` permission

#### Activate User
```
POST /api/users/:userId/activate
Authorization: Bearer <accessToken>
```
Requires: `users:manage` permission

#### Delete User
```
DELETE /api/users/:userId
Authorization: Bearer <accessToken>
```
Requires: `admin` role

### Permission Management

#### Get User Permissions
```
GET /api/permissions/users/:userId
Authorization: Bearer <accessToken>
```

#### Check Permission
```
POST /api/permissions/users/:userId/check
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "permission": "dashboard:view"
}
```

#### Assign Permissions
```
PUT /api/permissions/users/:userId
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "permissions": ["dashboard:view", "users:manage"]
}
```
Requires: `permissions:manage` permission

#### Check Grant Ceiling
```
GET /api/permissions/users/:userId/grant-ceiling
Authorization: Bearer <accessToken>
```

## 🔐 Role Hierarchy

```
Admin (Level 3)
  ├─ dashboard:view, dashboard:manage
  ├─ users:manage
  ├─ permissions:manage
  └─ audit:view

Manager (Level 2)
  ├─ dashboard:view
  ├─ users:view, users:manage
  ├─ permissions:view
  └─ audit:view

Agent (Level 1)
  ├─ dashboard:view
  ├─ tickets:create, tickets:update
  └─ reports:view

Customer (Level 0)
  ├─ dashboard:view
  ├─ tickets:create
  ├─ profile:view, profile:edit
```

## 🛡️ Security Practices

- **Password Hashing**: bcryptjs with 10 salt rounds
- **JWT Tokens**: Separate access (15m) & refresh (7d) tokens
- **Token Blacklist**: Logout invalidates tokens
- **Grant Ceiling**: Users can't assign higher permissions than themselves
- **Rate Limiting**: 100 requests per 15 minutes
- **CORS**: Configurable origin support
- **Helmet**: Security headers via helmet.js
- **Input Validation**: Zod schema validation on all requests

## 📊 Database Schema

### Users Collection
```typescript
{
  email: string (unique, indexed)
  password: string (hashed)
  role: enum ['admin', 'manager', 'agent', 'customer']
  permissions: string[]
  isSuspended: boolean (indexed)
  createdAt: date (indexed)
  updatedAt: date
}
```

### Audit Logs Collection
```typescript
{
  userId: string (indexed)
  action: enum ['CREATE', 'READ', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'PERMISSION_CHANGE']
  resource: enum ['USER', 'PERMISSION', 'ROLE', 'SYSTEM']
  resourceId?: string (indexed)
  changes?: object
  status: enum ['success', 'failure']
  reason?: string
  ipAddress?: string
  userAgent?: string
  createdAt: date (indexed)
}
```

## 🧪 Testing Workflow

### 1. Register Admin User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "Admin123!",
    "role": "admin"
  }'
```

### 2. Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "Admin123!"
  }'
```

### 3. Create Regular User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "User123!",
    "role": "customer"
  }'
```

### 4. Assign Permissions (as Admin)
```bash
curl -X PUT http://localhost:5000/api/permissions/users/{userId} \
  -H "Authorization: Bearer {accessToken}" \
  -H "Content-Type: application/json" \
  -d '{
    "permissions": ["dashboard:view", "tickets:create"]
  }'
```

## 📦 Deployment

### Docker Support
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 5000
CMD ["node", "dist/server.js"]
```

### Render.com
1. Connect your GitHub repository
2. Create new Web Service
3. Build command: `npm run build`
4. Start command: `npm start`
5. Add environment variables from `.env.example`
6. Deploy!

### Vercel Functions
Deploy as serverless function (requires adaptation):
```bash
npm run build
vercel deploy
```

## 📝 Environment Variables

```env
# Database
MONGO_URI=mongodb+srv://...

# JWT
JWT_SECRET=your-secret-key
JWT_ACCESS_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d

# Server
PORT=5000
NODE_ENV=production

# Security
CORS_ORIGIN=https://yourdomain.com
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=info
```

## 🎯 Next Steps

- [ ] Add unit & integration tests
- [ ] Implement OpenAPI/Swagger documentation
- [ ] Add refresh token rotation
- [ ] Implement 2FA/MFA
- [ ] Add email verification
- [ ] Implement password reset flow
- [ ] Add admin dashboard API
- [ ] Implement API key authentication
- [ ] Add webhook support
- [ ] Implement caching layer (Redis)

## 📄 License

MIT

# RBAC Backend

A production-ready REST API with role-based access control, JWT authentication, and comprehensive audit logging.

## Quick Start

### Install & Run
```bash
npm install
cp .env.example .env
# Update .env with your MongoDB URI and JWT secret
npm run dev
```

Server runs on `http://localhost:5000/api`

## Architecture

Clean MVC structure with TypeScript:
- **Controllers** - Request handlers for auth, users, permissions
- **Services** - Business logic and permission management
- **Models** - User and AuditLog schemas
- **Middleware** - Authentication, RBAC, error handling
- **Routes** - Auth, user, and permission endpoints

## Features

- **JWT Authentication** - Access (15m) & refresh (7d) tokens
- **RBAC System** - Admin, Manager, Agent, Customer roles
- **Permission Management** - Dynamic role-based access
- **Audit Logging** - Full action tracking
- **Input Validation** - Zod schema validation
- **Error Handling** - Custom error classes with global handler
- **Security** - Helmet, CORS, rate limiting, bcrypt hashing
- **Logging** - Winston logger to file and console
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



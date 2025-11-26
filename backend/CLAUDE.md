# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **Relief Coordination System** backend built with Express.js and MongoDB. The system enables users to report emergencies/disasters, assigns tasks to volunteers, and provides admin oversight for disaster response coordination.

## Key Technologies

- **Runtime**: Node.js (CommonJS modules)
- **Framework**: Express 5.x
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT-based (access + refresh tokens)
- **Security**: Helmet, CORS, express-rate-limit, bcryptjs

## Development Commands

```bash
# Install dependencies
npm install

# Development server with auto-reload
npm run dev

# Production server
npm start

# List all API routes
# Visit http://localhost:<PORT>/list in browser or curl
```

## Environment Setup

Required environment variables (see `.env.example`):
- `MONGODB_URI` - MongoDB connection string
- `PORT` - Server port (default: 3000)
- `JWT_SECRET` - Secret for access tokens (15min expiry)
- `JWT_REFRESH_SECRET` - Secret for refresh tokens (7d expiry)
- `NODE_ENV` - Environment (development/production)

The server validates all required env vars at startup and exits if any are missing.

## Architecture

### Core Structure

```
backend/
├── server.js                 # App entry point, middleware setup
├── models/                   # Mongoose schemas
│   ├── user.js              # User model with roles & geolocation
│   ├── report.js            # Emergency report model with geospatial indexing
│   └── refreshToken.js      # JWT refresh token storage
├── routes/                   # API route handlers
│   ├── auth.js              # Register, login, logout, token refresh
│   ├── reports.js           # CRUD operations for emergency reports
│   ├── users.js             # User management endpoints
│   ├── admin.js             # Admin-only operations
│   └── volunteer.js         # Volunteer task management
├── middleware/
│   └── auth.js              # JWT verification & role authorization
└── public/                   # Static frontend files (HTML/CSS/JS)
```

### Authentication Flow

1. **Access Tokens**: 15-minute expiry, included in `Authorization: Bearer <token>` header
2. **Refresh Tokens**: 7-day expiry, stored in MongoDB RefreshToken collection
3. **Token Refresh**: POST to `/api/auth/token` with refresh token to get new access token
4. **Logout**: Deletes refresh token from database

All protected routes use `verifyToken` middleware. Role-based routes additionally use `authorize('role1', 'role2')` middleware.

### User Roles

- **user**: Can create reports, view reports
- **volunteer**: All user permissions + accept/resolve assigned tasks
- **admin**: Full system access including user/report deletion

### Geospatial Features

Both `User` and `Report` models include GeoJSON `location` fields with 2dsphere indexes for proximity queries:
- Reports can be queried by location using `GET /api/reports/nearby?lng=X&lat=Y&radius=5000`
- Location format: `{ type: "Point", coordinates: [longitude, latitude] }`

### Report Status Lifecycle

Reports follow this status flow:
1. `reported` → Initial state when created
2. `reviewing` → Under admin/volunteer review
3. `assigned` → Assigned to a volunteer
4. `resolving` → Volunteer working on it
5. `resolved` → Task completed

### API Route Organization

All routes are prefixed with `/api`:
- `/api/auth/*` - Authentication endpoints (public)
- `/api/reports/*` - Report CRUD (requires auth)
- `/api/users/*` - User profile management (requires auth)
- `/api/admin/*` - Admin operations (requires admin role)
- `/api/volunteer/*` - Volunteer task operations (requires volunteer/admin role)

### Security Measures

- **Rate Limiting**: 100 requests per 15 minutes per IP
- **Helmet**: CSP configured to allow self + Tailwind CDN (for public HTML)
- **Request Size**: Limited to 10kb for JSON/URL-encoded bodies
- **Password Requirements**: Minimum 6 chars with uppercase, lowercase, and digit
- **Token Validation**: Strict bearer token format checks with helpful error messages

### Important Implementation Details

- **Middleware Chain**: Always use `verifyToken` before `authorize()` - verifyToken populates `req.user` and `req.userId`
- **ObjectId Validation**: Routes validate MongoDB ObjectIds using `mongoose.Types.ObjectId.isValid()` before queries
- **Error Responses**: Consistent format `{ success: false, message: "..." }` or `{ message: "..." }`
- **Population**: Report queries populate `reportedBy` and `assignedTo` with user details (username, email, role)
- **Password Hashing**: Use bcrypt with salt rounds of 10 for all password operations
- **Static Files**: Served from `public/` directory AFTER API routes to prevent conflicts

### Database Schema Notes

**User Model**:
- Unique index on `email`
- Non-unique index on `username`
- 2dsphere index on `location`
- `skills` array for volunteer capabilities
- `isVerified` flag (currently not enforced)

**Report Model**:
- 2dsphere index on `location` for geospatial queries
- Indexes on `status` and `category` for filtering
- Coordinates validated as [longitude, latitude] array with exactly 2 elements
- References to User model for `reportedBy` and `assignedTo`

**RefreshToken Model**:
- TTL index with 7-day expiration (MongoDB auto-deletes)
- Index on `userId` for efficient lookup

### Common Patterns

When adding new protected routes:
```javascript
router.get('/endpoint', verifyToken, authorize('role1', 'role2'), async (req, res) => {
  // Access user info via req.user.id, req.user.email, req.user.role
  // Or use shortcut req.userId
});
```

When working with coordinates:
```javascript
// Always use [longitude, latitude] order (GeoJSON spec)
location: { type: "Point", coordinates: [lng, lat] }
```

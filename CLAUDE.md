# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Relief Coordination System** - A real-time disaster reporting and coordination platform where citizens submit emergencies with photos and GPS location, volunteers receive instant alerts and manage tasks, and admins verify reports through a centralized dashboard.

## Architecture

This is a **monorepo** with separate frontend and backend applications:

- **Frontend**: React 19 + TypeScript + Vite + TailwindCSS (shadcn/ui components)
- **Backend**: Node.js + Express + MongoDB + Socket.IO

### Technology Stack

**Frontend**:
- React 19.2 with React Router v7 for routing
- TypeScript with path aliases (`@/*` maps to `src/*`)
- Vite 7 as build tool
- TailwindCSS v4 with shadcn/ui components
- Radix UI primitives for accessible components

**Backend**:
- Node.js with CommonJS modules
- Express 5.x with security middleware (Helmet, CORS, rate limiting)
- MongoDB with Mongoose ODM (geospatial indexing support)
- JWT authentication (access + refresh tokens)
- Socket.IO for real-time features (installed but not fully implemented)

## Development Commands

### Frontend
```bash
cd frontend

# Install dependencies
npm install

# Development server (Vite dev server with HMR)
npm run dev

# Build for production (TypeScript compilation + Vite build)
npm run build

# Lint code
npm run lint

# Preview production build
npm run preview
```

### Backend
```bash
cd backend

# Install dependencies
npm install

# Development server with auto-reload (nodemon)
npm run dev

# Production server
npm start

# List all API routes
# Visit http://localhost:<PORT>/list in browser or curl
```

## Environment Setup

### Frontend
Create `frontend/.env`:
```
VITE_BACKEND_URL=http://localhost:5000
```

### Backend
Create `backend/.env` with required variables (server validates and exits if missing):
```
MONGODB_URI=mongodb://localhost:27017/relief-coordination
PORT=5000
JWT_SECRET=your-access-token-secret
JWT_REFRESH_SECRET=your-refresh-token-secret
NODE_ENV=development
```

## Frontend Architecture

### Directory Structure
```
frontend/src/
├── components/
│   ├── ui/              # shadcn/ui components (button, input, card, etc.)
│   ├── custom/          # Custom components (Navbar, route guards, etc.)
│   └── theme/           # Theme provider and mode toggle
├── pages/
│   ├── auth/            # Login, Register
│   ├── user/            # User dashboard, create reports
│   ├── volunteer/       # Volunteer dashboard, tasks
│   ├── admin/           # Admin dashboard, users, reports
│   └── common/          # Shared pages (ReportsList, ReportView, NotFound)
├── context/
│   └── APIContext.tsx   # Centralized API client with auth & auto-refresh
├── router/
│   └── AppRouter.tsx    # Route definitions with role-based guards
├── types/
│   └── index.ts         # TypeScript type definitions
└── lib/
    └── utils.ts         # Utility functions (cn for className merging)
```

### Key Frontend Patterns

**Route Protection**: Three route guard components based on user role:
- `ProtectedRoute` - Requires authentication (any logged-in user)
- `VolunteerRoute` - Requires volunteer or admin role
- `AdminRoute` - Requires admin role only

**API Client Pattern**:
- All API calls go through `APIContext` (accessed via `useApi()` hook)
- Automatic JWT refresh on token expiration
- Centralized auth state management with localStorage persistence
- Type-safe API methods with TypeScript

**Component Architecture**:
- UI components use Radix UI primitives with custom styling via `class-variance-authority`
- `cn()` utility function combines clsx and tailwind-merge for className composition
- Theme support via ThemeProvider context (light/dark mode)

### Authentication Flow (Frontend)

1. User logs in via `login(email, password)`
2. Tokens and user object stored in localStorage + state
3. All protected API calls use `safeFetch()` which:
   - Attaches access token to request
   - Catches auth errors (expired/invalid token)
   - Automatically calls refresh token endpoint
   - Retries original request with new access token
4. Logout clears tokens from localStorage and server

### Important Frontend Details

- **Path Aliases**: `@/*` resolves to `src/*` (configured in vite.config.ts and tsconfig.json)
- **Base URL**: Configured via `VITE_BACKEND_URL` env var, defaults to empty string (same origin)
- **Geolocation Format**: Always `[longitude, latitude]` order (GeoJSON spec)
- **Report Categories**: fire, flood, accident, earthquake, landslide, storm, other
- **Report Status Flow**: reported → reviewing → assigned → resolving → resolved

## Backend Architecture

See `backend/CLAUDE.md` for complete backend documentation.

### Quick Backend Reference

**User Roles**: user, volunteer, admin

**Auth Endpoints** (`/api/auth/*`):
- POST `/register` - Create new user
- POST `/login` - Get access + refresh tokens
- POST `/token` - Refresh access token
- POST `/logout` - Invalidate refresh token

**Protected Endpoints** (require `Authorization: Bearer <token>`):
- `/api/reports/*` - Report CRUD operations
- `/api/users/*` - User profile management
- `/api/volunteer/*` - Volunteer task operations
- `/api/admin/*` - Admin-only operations

**Geospatial Queries**:
- GET `/api/reports/nearby?lng=X&lat=Y&radius=5000` - Find reports within radius (meters)

## Integration Between Frontend & Backend

### Authentication Headers
Frontend automatically includes `Authorization: Bearer <accessToken>` via APIContext for all protected routes.

### Data Mapping
- Frontend `Report.id` ↔ Backend `Report._id` (MongoDB ObjectId)
- Frontend `User.id` ↔ Backend `User._id`
- Location format is consistent: GeoJSON Point with `[longitude, latitude]`

### Auto-Refresh Token Flow
1. Frontend API call fails with auth error
2. APIContext catches error and calls `/api/auth/token` with refresh token
3. New access token saved to localStorage
4. Original request retried with new token
5. If refresh fails, user redirected to login

## Common Development Tasks

### Adding a New Protected Frontend Route
1. Create page component in appropriate `pages/` subdirectory
2. Import and add route in `AppRouter.tsx`
3. Wrap with appropriate route guard (`ProtectedRoute`, `VolunteerRoute`, or `AdminRoute`)

### Adding a New API Endpoint
1. Add route handler in appropriate `backend/routes/*.js` file
2. Use `verifyToken` middleware for auth
3. Add `authorize('role1', 'role2')` for role-based access
4. Add corresponding method in `frontend/src/context/APIContext.tsx`
5. Add TypeScript types in `frontend/src/types/index.ts`

### Working with Geospatial Data
Always use `[longitude, latitude]` order:
```javascript
// Frontend (CreateReport, updateLocation)
{ lng: -122.4194, lat: 37.7749 }

// Backend storage/queries
location: { type: "Point", coordinates: [-122.4194, 37.7749] }
```

## Code Style & Conventions

### Frontend
- Use functional components with hooks (no class components)
- Prefer `const` arrow functions for component definitions
- Use TypeScript interfaces for props and data structures
- Import React types from 'react' (e.g., `React.FC`, `React.ReactNode`)
- Use path aliases: `@/components/...`, `@/pages/...`, etc.

### Backend
- CommonJS modules (`require`, `module.exports`)
- Async/await for all async operations (no raw promises)
- Consistent error response format: `{ success: false, message: "..." }`
- Validate MongoDB ObjectIds before queries
- Always populate user references in report queries

## Security Considerations

- Never commit `.env` files (use `.env.example` for templates)
- Backend validates all required env vars at startup
- Rate limiting: 100 requests per 15 minutes per IP
- Password requirements: min 6 chars, uppercase, lowercase, digit
- JWT access tokens expire in 15 minutes
- JWT refresh tokens expire in 7 days
- All coordinates validated as valid lat/lng values
- Request body size limited to 10kb

## Real-Time Features (Socket.IO)

Socket.IO is installed in backend dependencies but not yet fully implemented. Future implementation should handle:
- Real-time report notifications to volunteers
- Live chat between reporters and volunteers
- Status update broadcasts to admins

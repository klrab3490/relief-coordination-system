# 🚨 Relief Coordination System

<div align="center">

![Status](https://img.shields.io/badge/status-production--ready-success)
![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

**A real-time disaster reporting and coordination platform for emergency response**

[Features](#-features) • [Tech Stack](#-tech-stack) • [Getting Started](#-getting-started) • [Documentation](#-documentation) • [Deployment](#-deployment)

</div>

---

## 📖 Overview

The **Relief Coordination System** is a comprehensive platform that connects citizens, volunteers, and administrators during disaster situations. Users can report emergencies with photos and GPS coordinates, volunteers can accept and manage tasks in real-time, and admins oversee the entire operation through a centralized dashboard.

### 🎯 Key Capabilities

- 📸 **Emergency Reporting** - Citizens submit incidents with photos and exact GPS location
- 🗺️ **Interactive Maps** - Visual location selection with reverse geocoding
- 💬 **Real-time Chat** - Instant communication via WebSocket
- 🎯 **Task Management** - Volunteers accept, update, and resolve assignments
- 👥 **Role-based Access** - Secure authentication with user/volunteer/admin roles
- 📊 **Admin Dashboard** - Centralized monitoring and management
- ☁️ **Cloud Storage** - Dual-mode image storage (local/Cloudinary)

---

## ✨ Features

### 🔐 **Authentication & Authorization**
- JWT-based authentication (access + refresh tokens)
- Role-based access control (User, Volunteer, Admin)
- Automatic token refresh on expiration
- Secure password hashing with bcrypt
- Protected routes with route guards

### 📍 **Location & Mapping**
- Interactive map with Leaflet + OpenStreetMap
- Click-to-select location
- Reverse geocoding (coordinates → human-readable address)
- Auto-detect user's current GPS location
- Geospatial queries for nearby incidents
- 2dsphere indexing for performance

### 📸 **Image Upload**
- Drag & drop image upload
- Real-time preview before submission
- Dual-mode storage:
  - **Development:** Local disk storage
  - **Production:** Cloudinary CDN
- Auto-resize and quality optimization
- File type validation (JPEG, PNG, GIF, WebP)
- 5MB size limit with error handling

### 💬 **Real-time Communication**
- WebSocket-based chat with Socket.IO
- Room-based messaging (general + report-specific)
- Typing indicators
- Online/offline status
- Message timestamps
- Auto-scroll to new messages

### 🚨 **Emergency Reports**
- Create detailed incident reports
- Category selection (fire, flood, accident, earthquake, etc.)
- Status tracking (reported → reviewing → assigned → resolving → resolved)
- Assign volunteers to specific reports
- View nearby incidents with radius search
- Filter and sort reports

### 👷 **Volunteer Management**
- View assigned tasks
- Accept available tasks
- Update task status
- Mark tasks as resolved
- Task notification system

### 👨‍💼 **Admin Controls**
- User management (view, delete)
- Report management (view, update, delete)
- Status updates
- Volunteer assignment
- System-wide monitoring

---

## 🛠️ Tech Stack

### **Frontend**
| Technology | Purpose |
|-----------|---------|
| React 19.2 | UI framework |
| TypeScript | Type safety |
| Vite 7 | Build tool & dev server |
| React Router v7 | Client-side routing |
| TailwindCSS v4 | Styling |
| shadcn/ui | UI components (Radix UI) |
| Leaflet | Interactive maps |
| Socket.IO Client | WebSocket client |

### **Backend**
| Technology | Purpose |
|-----------|---------|
| Node.js | Runtime environment |
| Express 5.x | Web framework |
| MongoDB | Database (Atlas) |
| Mongoose | ODM for MongoDB |
| Socket.IO | WebSocket server |
| JWT | Authentication |
| Multer | File uploads |
| Cloudinary | Cloud image storage |
| Bcrypt | Password hashing |

### **Security & Infrastructure**
- Helmet (Security headers)
- CORS (Cross-origin protection)
- Express Rate Limit (DDoS protection)
- MongoDB 2dsphere indexing (Geospatial queries)
- Environment-based configuration

---

## 📋 Prerequisites

Before running this project, ensure you have:

- **Node.js** v18+ ([Download](https://nodejs.org))
- **MongoDB Atlas** account ([Sign up](https://www.mongodb.com/cloud/atlas))
- **Git** ([Download](https://git-scm.com))
- **(Optional)** Cloudinary account for production ([Sign up](https://cloudinary.com))

---

## 🚀 Getting Started

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/yourusername/relief-coordination-system.git
cd relief-coordination-system
```

### 2️⃣ Install Dependencies

**Backend:**
```bash
cd backend
npm install
```

**Frontend:**
```bash
cd frontend
npm install
```

### 3️⃣ Configure Environment Variables

**Backend (`backend/.env`):**
```bash
# Copy example file
cp .env.example .env

# Edit .env with your values:
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/relief-coordination
PORT=5000
NODE_ENV=development

JWT_SECRET=your-strong-secret-here
JWT_REFRESH_SECRET=your-refresh-secret-here

ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000

# Optional: Cloudinary (for production)
# CLOUDINARY_CLOUD_NAME=your-cloud-name
# CLOUDINARY_API_KEY=your-api-key
# CLOUDINARY_API_SECRET=your-api-secret
```

**Frontend (`frontend/.env`):**
```bash
# Copy example file
cp .env.example .env

# Edit .env:
VITE_BACKEND_URL=http://localhost:5000
```

### 4️⃣ Run the Application

**Start Backend (Terminal 1):**
```bash
cd backend
npm run dev
```
Server runs on http://localhost:5000

**Start Frontend (Terminal 2):**
```bash
cd frontend
npm run dev
```
App runs on http://localhost:5173

### 5️⃣ Access the Application

Open your browser and navigate to:
```
http://localhost:5173
```

**Default Test Users:**
You'll need to register new users through the UI.

---

## 📁 Project Structure

```
relief-coordination-system/
├── backend/                    # Node.js + Express API
│   ├── middleware/            # Authentication middleware
│   │   └── auth.js           # JWT verification & role check
│   ├── models/               # Mongoose schemas
│   │   ├── user.js          # User model with geolocation
│   │   ├── report.js        # Emergency report model
│   │   └── refreshToken.js  # JWT refresh token storage
│   ├── routes/              # API endpoints
│   │   ├── auth.js         # Register, login, logout, token refresh
│   │   ├── reports.js      # Report CRUD + geospatial queries
│   │   ├── users.js        # User profile management
│   │   ├── volunteer.js    # Volunteer task operations
│   │   ├── admin.js        # Admin-only operations
│   │   └── upload.js       # Image upload (local + Cloudinary)
│   ├── uploads/            # Local image storage (dev)
│   ├── utils/              # Utility functions
│   ├── server.js           # Express server + Socket.IO setup
│   ├── package.json        # Backend dependencies
│   └── .env               # Environment variables
│
├── frontend/                 # React + TypeScript SPA
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/         # shadcn/ui components
│   │   │   ├── custom/     # Custom components
│   │   │   │   ├── Navbar.tsx
│   │   │   │   ├── ImageUploader.tsx
│   │   │   │   ├── MapPicker.tsx
│   │   │   │   ├── ProtectedRoute.tsx
│   │   │   │   ├── AdminRoute.tsx
│   │   │   │   └── VolunteerRoute.tsx
│   │   │   └── theme/      # Theme provider
│   │   ├── context/
│   │   │   ├── APIContext.tsx      # API client + auth
│   │   │   └── ChatContext.tsx     # WebSocket management
│   │   ├── pages/
│   │   │   ├── auth/              # Login, Register
│   │   │   ├── user/              # User dashboard, create report
│   │   │   ├── volunteer/         # Volunteer dashboard, tasks
│   │   │   ├── admin/             # Admin users, reports
│   │   │   └── common/            # Shared pages (reports list, chat)
│   │   ├── router/
│   │   │   └── AppRouter.tsx      # Route definitions
│   │   ├── types/
│   │   │   └── index.ts          # TypeScript interfaces
│   │   ├── lib/
│   │   │   └── utils.ts          # Utility functions
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json              # Frontend dependencies
│   └── .env                     # Environment variables
│
├── CLAUDE.md                    # Project documentation for AI
├── DEPLOYMENT.md                # Production deployment guide
├── ENV_SETUP.md                 # Environment variables guide
├── CLOUDINARY_SETUP.md          # Cloudinary setup guide
├── IMPLEMENTATION_STATUS.md     # Feature completion status
└── README.md                    # This file
```

---

## 🔌 API Documentation

### **Base URL**
```
Development: http://localhost:5000/api
Production: https://your-backend.railway.app/api
```

### **Authentication Endpoints**

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/register` | Register new user | ❌ |
| POST | `/auth/login` | Login user | ❌ |
| POST | `/auth/token` | Refresh access token | ❌ |
| POST | `/auth/logout` | Logout user | ❌ |

### **Report Endpoints**

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/reports/create` | Create new report | ✅ |
| GET | `/reports` | Get all reports | ✅ |
| GET | `/reports/:id` | Get report by ID | ✅ |
| GET | `/reports/nearby?lng=X&lat=Y&radius=5000` | Get nearby reports | ✅ |
| PATCH | `/reports/:id/status` | Update report status | ✅ Volunteer/Admin |
| PATCH | `/reports/:id/assign` | Assign volunteer | ✅ Volunteer/Admin |
| DELETE | `/reports/:id` | Delete report | ✅ Admin |

### **User Endpoints**

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/users/profile/:id` | Get user profile | ✅ |
| PATCH | `/users/location/:id` | Update user location | ✅ |

### **Volunteer Endpoints**

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/volunteer/tasks` | Get assigned tasks | ✅ Volunteer/Admin |
| PATCH | `/volunteer/tasks/:id/accept` | Accept task | ✅ Volunteer |
| PATCH | `/volunteer/tasks/:id/resolve` | Mark task resolved | ✅ Volunteer/Admin |

### **Admin Endpoints**

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/admin/users` | Get all users | ✅ Admin |
| GET | `/admin/reports` | Get all reports | ✅ Admin |
| DELETE | `/admin/user/:id` | Delete user | ✅ Admin |
| DELETE | `/admin/report/:id` | Delete report | ✅ Admin |
| PATCH | `/admin/report/:id/status` | Update report status | ✅ Admin |

### **Upload Endpoints**

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/upload/image` | Upload image (multipart/form-data) | ✅ |
| DELETE | `/upload/image` | Delete image | ✅ |

### **WebSocket Events**

**Client → Server:**
- `join_room` - Join a chat room
- `leave_room` - Leave a chat room
- `send_message` - Send message to room
- `typing` - Notify typing status
- `stop_typing` - Stop typing notification

**Server → Client:**
- `receive_message` - Receive new message
- `user_joined` - User joined room
- `user_left` - User left room
- `user_typing` - User is typing
- `user_stop_typing` - User stopped typing

---

## 🎨 User Roles & Permissions

### 👤 **User (Citizen)**
- ✅ Create emergency reports
- ✅ Upload images with reports
- ✅ Select location on map
- ✅ View all reports
- ✅ View report details
- ✅ Participate in chat

### 👷 **Volunteer**
- ✅ All User permissions
- ✅ View assigned tasks
- ✅ Accept available tasks
- ✅ Update task status
- ✅ Mark tasks as resolved
- ✅ Assign reports to themselves

### 👨‍💼 **Admin**
- ✅ All Volunteer permissions
- ✅ View all users
- ✅ Delete users
- ✅ Delete reports
- ✅ Assign tasks to volunteers
- ✅ Manage system-wide settings

---

## 🌐 Deployment

### **Recommended Setup**

| Component | Platform | Cost |
|-----------|----------|------|
| Frontend | Vercel | Free |
| Backend | Railway | Free tier |
| Database | MongoDB Atlas | Free (512MB) |
| Images | Cloudinary | Free (25GB) |

### **Quick Deploy Steps**

1. **Deploy Backend to Railway:**
   - Connect GitHub repository
   - Add environment variables
   - Deploy automatically

2. **Deploy Frontend to Vercel:**
   - Import GitHub repository
   - Set `VITE_BACKEND_URL` to Railway URL
   - Deploy

3. **Update CORS:**
   - Add Vercel URL to `ALLOWED_ORIGINS` in Railway

📚 **Detailed Guide:** See [DEPLOYMENT.md](./DEPLOYMENT.md)

---

## 🧪 Testing

### **Manual Testing Checklist**

**Authentication:**
- [ ] User registration works
- [ ] Login with valid credentials
- [ ] Token refresh after 15 minutes
- [ ] Logout clears tokens

**Report Creation:**
- [ ] Map loads correctly
- [ ] Location selection works
- [ ] Image upload succeeds
- [ ] Form validation works
- [ ] Report appears in list

**Real-time Chat:**
- [ ] WebSocket connects (green badge)
- [ ] Messages appear instantly
- [ ] Typing indicator works
- [ ] Works across multiple browsers

**Volunteer Tasks:**
- [ ] Volunteers see assigned tasks
- [ ] Accept task updates status
- [ ] Resolve task completes workflow

**Admin Functions:**
- [ ] Can view all users
- [ ] Can delete users/reports
- [ ] Can update report status

---

## 🔧 Development

### **Available Scripts**

**Backend:**
```bash
npm run dev      # Start with nodemon (auto-reload)
npm start        # Production server
```

**Frontend:**
```bash
npm run dev      # Vite dev server (HMR)
npm run build    # Production build
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

### **Code Style**

**Frontend:**
- Functional components with hooks
- TypeScript for type safety
- Path aliases (`@/components/...`)
- TailwindCSS for styling

**Backend:**
- CommonJS modules
- Async/await for async operations
- Mongoose for database queries
- Consistent error responses

---

## 🐛 Troubleshooting

### **CORS Errors**
**Problem:** API calls fail with CORS error

**Solution:**
1. Verify `ALLOWED_ORIGINS` in backend `.env`
2. Ensure no trailing slashes in URLs
3. Restart backend after env changes

### **WebSocket Won't Connect**
**Problem:** Red "Disconnected" badge in chat

**Solution:**
1. Check `VITE_BACKEND_URL` in frontend `.env`
2. Verify backend server is running
3. Check browser console for errors

### **Images Don't Upload**
**Problem:** Upload fails or images don't display

**Solution:**
1. Ensure `uploads/` directory exists (backend)
2. Check file size (5MB limit)
3. Verify file type (JPEG, PNG, GIF, WebP only)
4. For Cloudinary: Check API credentials

### **Map Doesn't Load**
**Problem:** Blank map on CreateReport page

**Solution:**
1. Check browser console for errors
2. Ensure internet connection (needs OSM tiles)
3. Verify Leaflet CSS is imported

---

## 📚 Documentation

- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Production deployment guide
- **[ENV_SETUP.md](./ENV_SETUP.md)** - Environment variables reference
- **[CLOUDINARY_SETUP.md](./CLOUDINARY_SETUP.md)** - Cloudinary configuration
- **[IMPLEMENTATION_STATUS.md](./IMPLEMENTATION_STATUS.md)** - Feature completion status
- **[CLAUDE.md](./CLAUDE.md)** - Project architecture for AI assistants

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### **Coding Standards**
- Follow existing code style
- Write clear commit messages
- Add comments for complex logic
- Test before submitting PR

---

## 📝 License

This project is licensed under the **MIT License** - see the [LICENSE](./LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Leaflet** - Interactive map library
- **OpenStreetMap** - Map tiles and data
- **Nominatim** - Reverse geocoding service
- **shadcn/ui** - Beautiful UI components
- **Radix UI** - Accessible component primitives
- **Cloudinary** - Image hosting and optimization
- **MongoDB Atlas** - Cloud database platform
- **Socket.IO** - Real-time communication

---

## 📧 Contact

**Project Maintainer:** Your Name

- GitHub: [@yourusername](https://github.com/yourusername)
- Email: your.email@example.com
- Website: [yourwebsite.com](https://yourwebsite.com)

**Project Link:** [https://github.com/yourusername/relief-coordination-system](https://github.com/yourusername/relief-coordination-system)

---

## 🌟 Show Your Support

If this project helped you, please consider giving it a ⭐️!

---

<div align="center">

**Built with ❤️ for emergency response coordination**

[⬆ Back to Top](#-relief-coordination-system)

</div>

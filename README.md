# Campus Skill Exchange Platform (SkillVerse) 🎓

A modern, full-stack, peer-to-peer knowledge sharing and mentorship web application for university students. Students exchange practical skills (such as Python, UI/UX Design, Machine Learning, Web Engineering, and Communication) on a reciprocal barter basis with zero money involved.

Built with **React 18 + Tailwind CSS + Vite** on the frontend, **Express.js + Socket.IO** on the backend, and **MongoDB / MongoDB Atlas** for database persistence.

---

## 🌐 Live Deployed Links

| Service | Platform | Live URL | Status |
| :--- | :--- | :--- | :--- |
| **Frontend Web App (Primary)** | **Vercel** | [https://campus-skill-exchange.vercel.app](https://campus-skill-exchange.vercel.app) | 🟢 Continuous Deployment from GitHub `main` |
| **Frontend Web App (Static)** | **Render** | [https://campus-skill-exchange-client.onrender.com](https://campus-skill-exchange-client.onrender.com) | 🟢 Auto-deployed via Render Blueprint |
| **Backend REST API** | **Render** | [https://campus-skill-exchange-api.onrender.com](https://campus-skill-exchange-api.onrender.com) | 🟢 Live Node.js + Express API |
| **API Health Check** | **Render** | [https://campus-skill-exchange-api.onrender.com/api/health](https://campus-skill-exchange-api.onrender.com/api/health) | 🟢 Online Uptime Monitor |
| **GitHub Repository** | **GitHub** | [https://github.com/gayatriborru/Campus-Skill-Exchange](https://github.com/gayatriborru/Campus-Skill-Exchange) | 🟢 Source of Truth |

---

## 🚀 Automatic Continuous Deployment (CI/CD)

Whenever changes are pushed to `origin main` on GitHub:
1. **Vercel** automatically detects the commit, builds the React + Vite frontend using [`vercel.json`](./vercel.json), and deploys to the global edge network.
2. **Render** automatically detects the commit, provisions the Node.js API and Socket.IO server via [`render.yaml`](./render.yaml), and deploys with zero downtime.

### Deploying to Vercel (1-Click Git Integration)
1. Go to [vercel.com](https://vercel.com/) and click **Add New > Project**.
2. Import `gayatriborru/Campus-Skill-Exchange` from GitHub.
3. Keep default settings (the root [`vercel.json`](./vercel.json) automatically sets build command to `cd client && npm install && npm run build` and output to `client/dist`).
4. (Optional) Add Environment Variables:
   - `VITE_API_URL`: `https://campus-skill-exchange-api.onrender.com/api`
   - `VITE_SOCKET_URL`: `https://campus-skill-exchange-api.onrender.com`
5. Click **Deploy**. Vercel will deploy your app in seconds!

### Deploying to Render (Blueprint)
1. Go to [dashboard.render.com](https://dashboard.render.com/) and click **New + > Blueprint**.
2. Select `Campus-Skill-Exchange` (`https://github.com/gayatriborru/Campus-Skill-Exchange`).
3. Set the `MONGODB_URI` environment variable to your MongoDB Atlas connection string.
4. Click **Apply**. Render will launch:
   - 🟢 `campus-skill-exchange-api` (Web Service on port 10000)
   - 🟢 `campus-skill-exchange-client` (Static Site CDN)


## 🛠 Tech Stack & Architecture

```
React 18 + Vite + Tailwind CSS (Frontend)
       ↕ [Axios + Bearer Auth & Socket.IO Client]
Express.js + Node.js + Socket.IO Server (Backend)
       ↕ [Mongoose ODM]
MongoDB Atlas Cloud Database (Data Layer)
```

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide Icons, Recharts, Framer Motion.
- **Backend**: Node.js, Express.js, Socket.IO, JWT Authentication, bcryptjs, express-validator.
- **Database**: MongoDB / MongoDB Atlas with collections for Users, Skills, StudentSkills, Sessions, Ratings, Messages, Notifications, Badges, and Reports.
- **Data Flow**: 100% database-driven with zero mock/fake data. Full Loading, Empty, and Error states across all pages.

---

## 📁 Repository Structure

```
Campus-Skill-Exchange/
├── client/                     # React 18 + Vite Frontend Application
│   ├── src/
│   │   ├── components/         # Reusable UI components & modals
│   │   ├── context/            # AuthContext, SocketContext, ToastContext
│   │   ├── pages/              # 8 Core application pages
│   │   ├── services/           # Axios API service layer (api.js, authService, etc.)
│   │   └── App.jsx
│   ├── .env.example            # Frontend environment variable reference
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
├── server/                     # Express.js + Socket.IO Backend API
│   ├── config/                 # MongoDB database connection
│   ├── controllers/            # REST API business logic controllers
│   ├── middleware/             # Auth JWT protect, validation, error handlers
│   ├── models/                 # Mongoose schema models
│   ├── routes/                 # Express route definitions
│   ├── services/               # Matching algorithm & gamification services
│   ├── socket/                 # Socket.IO real-time event handlers
│   ├── utils/                  # Seed scripts & token generators
│   ├── .env.example            # Backend environment variable reference
│   ├── package.json
│   └── server.js               # Main HTTP & Socket.IO entrypoint
├── render.yaml                 # Infrastructure as Code (Render Blueprint)
├── package.json                # Monorepo root scripts & unified runner
└── README.md
```

---

## ⚙️ Environment Variables Reference

### Backend (`server/.env`)
| Variable | Description | Production Example |
| :--- | :--- | :--- |
| `PORT` | Listening port for Express | `10000` (Render default) or `5000` |
| `NODE_ENV` | Environment mode | `production` |
| `MONGODB_URI` | MongoDB Atlas URI | `mongodb+srv://...` |
| `JWT_SECRET` | Secret key for JWT signing | `super_secret_jwt_key_2026_x...` |
| `JWT_EXPIRES_IN` | Token lifespan | `7d` |
| `CLIENT_URL` | Permitted origin for CORS | `https://campus-skill-exchange-client.onrender.com` |

### Frontend (`client/.env`)
| Variable | Description | Production Example |
| :--- | :--- | :--- |
| `VITE_API_URL` | Backend REST API endpoint | `https://campus-skill-exchange-api.onrender.com/api` |
| `VITE_SOCKET_URL` | Socket.IO connection URL | `https://campus-skill-exchange-api.onrender.com` |

---

## 💻 Local Development Setup

### Prerequisites
- Node.js v18+ installed
- MongoDB installed locally or a free MongoDB Atlas cluster

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/gayatriborru/Campus-Skill-Exchange.git
   cd Campus-Skill-Exchange
   ```

2. Install all dependencies:
   ```bash
   npm run install:all
   ```

3. Configure environment files:
   - Copy `server/.env.example` to `server/.env` and update `MONGODB_URI`.
   - Copy `client/.env.example` to `client/.env`.

4. Seed the database with campus taxonomy and initial badges:
   ```bash
   npm run seed
   ```

5. Run both frontend and backend concurrently:
   ```bash
   npm run dev
   ```

- Frontend runs at: `http://localhost:5173`
- Backend API runs at: `http://localhost:5000`
- Backend Health Check: `http://localhost:5000/api/health`

---

## 📡 Core API Endpoints

- **Authentication**: `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/profile`, `PUT /api/auth/profile`
- **Users**: `GET /api/users`, `GET /api/users/:id`, `GET /api/users/skills`, `POST /api/users/skills`, `DELETE /api/users/skills/:id`
- **Skills Taxonomy**: `GET /api/skills`, `GET /api/skills/categories`, `POST /api/skills`
- **Smart Matchmaker**: `GET /api/matches`
- **Sessions & Scheduling**: `GET /api/sessions`, `POST /api/sessions`, `PUT /api/sessions/:id`
- **Peer Ratings**: `POST /api/ratings`
- **Real-Time Messages**: `GET /api/messages/conversations`, `GET /api/messages/:userId`, `POST /api/messages`
- **Badges & Achievements**: `GET /api/badges`
- **Platform Analytics**: `GET /api/analytics/platform-stats`, `GET /api/admin/analytics`
- **Administration**: `GET /api/admin/dashboard`, `PUT /api/admin/users/:id/block`, `GET /api/admin/reports`

---

## 📄 License
This project is open-source and available under the [MIT License](LICENSE).

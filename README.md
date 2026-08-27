# 🫀 Student Pulse

## Cloud-Based Student Management Platform

> *"Track. Analyze. Improve."*

Student Pulse is a microservices-based student management platform with decoupled frontend and backend services communicating via RESTful APIs. It analyzes student lifestyle patterns, productivity habits, stress indicators, and academic consistency to predict burnout risk and improve student well-being.

---

## 🚀 Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 19, Vite, Tailwind CSS, shadcn/ui, Framer Motion, Recharts |
| **Backend** | FastAPI, Python 3.11 |
| **Database** | PostgreSQL (RDBMS) via SQLAlchemy 2.0 (async) |
| **Auth & Security** | JWT (python-jose + passlib/bcrypt), Role-Based Access Control (RBAC) |
| **Cloud Sync** | Firebase (Firestore) |
| **Containerization** | Docker, Docker Compose |
| **CI/CD** | GitHub Actions |
| **Deployment** | Render (backend) + Netlify (frontend) |

---

## 📁 Project Structure

```
StudentPulse/
├── .github/workflows/        # CI/CD pipeline (GitHub Actions)
│   └── deploy.yml
├── backend/                   # FastAPI backend (microservice)
│   ├── app/
│   │   ├── core/             # Config, Database, Security + RBAC
│   │   ├── models/           # SQLAlchemy models (User, Activity, Prediction, LinkCode)
│   │   ├── routers/          # REST API endpoints
│   │   │   ├── admin.py      # Admin CRUD (RBAC-protected)
│   │   │   ├── analytics.py  # Burnout prediction + weekly summary
│   │   │   ├── auth.py       # Register, Login, Google OAuth
│   │   │   ├── gamification.py  # XP, badges, streaks
│   │   │   ├── parent.py     # Parent-student linking
│   │   │   └── tracking.py   # Daily activity logging
│   │   └── main.py           # App entry point
│   ├── seed_admin.py         # CLI — create admin accounts
│   ├── Dockerfile
│   ├── .dockerignore
│   └── requirements.txt
├── frontend/                  # React + Vite frontend (microservice)
│   ├── src/
│   │   ├── components/ui/    # shadcn/ui + custom components
│   │   ├── hooks/            # Custom React hooks
│   │   ├── layouts/          # Dashboard & Parent shell layouts
│   │   ├── lib/              # API client, Auth, Firebase, Theme
│   │   ├── pages/            # All page components
│   │   │   ├── dashboard/    # Student dashboard pages
│   │   │   └── parent/       # Parent monitoring pages
│   │   ├── App.jsx           # Route definitions
│   │   └── main.jsx          # React entry point
│   ├── package.json
│   └── vite.config.js
├── docker-compose.yml         # Local dev stack (API + PostgreSQL)
├── render.yaml                # Render deployment blueprint
└── netlify.toml               # Netlify deployment config
```

---

## 🛠️ Setup

### Prerequisites
- Python 3.11+
- Node.js 20+
- PostgreSQL 16+ (or use Docker)
- Docker & Docker Compose (optional)

### Option 1: Docker Compose (Recommended)

```bash
# Start backend + PostgreSQL in one command
docker-compose up -d

# Seed an admin account
cd backend
python seed_admin.py --email admin@studentpulse.com --password YourSecurePass

# Start frontend
cd frontend
npm install
npm run dev
```

### Option 2: Manual Setup

#### Backend
```bash
cd backend
pip install -r requirements.txt

# Create admin account
python seed_admin.py

# Start the API server
uvicorn app.main:app --reload
# API docs: http://localhost:8000/docs
```

#### Frontend
```bash
cd frontend
npm install
npm run dev
# Opens at: http://localhost:3000
```

---

## 🔐 Authentication & RBAC

Student Pulse implements JWT-based authentication with Role-Based Access Control:

| Role | Capabilities |
|------|-------------|
| **student** | Log activities, view burnout predictions, track homework/notes/projects, view achievements |
| **parent** | Generate link codes, monitor linked students' wellbeing |
| **admin** | All student/parent capabilities + manage users, view platform stats, delete accounts |

### Creating an Admin Account

```bash
# Interactive mode
cd backend
python seed_admin.py

# Or with flags
python seed_admin.py --email admin@sp.com --password Admin123! --name "Admin"
```

---

## ✨ Features

- 📊 **Smart Daily Tracking** — Log sleep, study, gaming, mood, stress & more
- 🧠 **Burnout Prediction** — AI-powered burnout risk assessment with contributing factors
- 📈 **Productivity Dashboard** — Interactive Recharts analytics with weekly summaries
- 🏆 **Gamification** — XP system, streaks, 12 badge types & level progression
- 📋 **Homework Manager** — Track assignments with deadlines & priorities
- 🗒️ **Smart Notes** — Color-coded, pinnable notes for study organization
- 📁 **Project Tracker** — Academic project management with progress tracking
- 👨‍👩‍👧 **Parent Monitoring** — Linked accounts with real-time wellness insights
- 🔐 **Admin Dashboard** — User management, platform statistics, RBAC
- 🌙 **Futuristic UI** — Dark theme, glassmorphism, neon glow, Framer Motion animations
- 🐳 **Docker Support** — Containerized deployment with Docker Compose
- 🔄 **CI/CD** — Automated testing & deployment via GitHub Actions

---

## 🚀 Deployment

### Backend → Render
The `render.yaml` blueprint auto-provisions:
- A Python web service running the FastAPI backend
- A PostgreSQL database

Push to `main` → Render auto-deploys from source.

### Frontend → Netlify
The `netlify.toml` configures:
- Vite build from `frontend/` directory
- SPA routing fallback to `index.html`

Push to `main` → Netlify auto-deploys from source.

### CI/CD → GitHub Actions
On push to `main`:
1. Backend CI: Lint, verify imports, build Docker image
2. Frontend CI: Install deps, build Vite production bundle
3. Deploy notification on success

---

## 📄 API Documentation

Once the backend is running, interactive API docs are available at:
- **Swagger UI**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc**: [http://localhost:8000/redoc](http://localhost:8000/redoc)

---

## 👤 Author

**Dibyaprakash Patnaik**  
📧 dibyaprakash1405@gmail.com  
🔗 [GitHub](https://github.com/Dibyaprakash-P) · [LinkedIn](https://linkedin.com/in/dibya-prakash-patnaik)

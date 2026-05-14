# 🫀 Student Pulse (SP)

## AI-Powered Student Burnout & Lifestyle Analytics Platform

> *"Track. Analyze. Improve."*

Student Pulse is a modern analytics platform designed for students, parents, and educational institutions. It analyzes student lifestyle patterns, productivity habits, stress indicators, and academic consistency to predict burnout risk and improve student well-being.

---

## 🚀 Tech Stack

| Layer | Technology |
|-------|------------|
| **Web Frontend** | Next.js 15, React 19, Recharts, Framer Motion |
| **Flutter App** | Flutter 3.41+, Dart, fl_chart, Provider, window_manager |
| **Styling** | Vanilla CSS / Glassmorphism + Neon Theme (Flutter & Web) |
| **Backend** | FastAPI, Python 3.10 |
| **Database** | SQLite (dev) / PostgreSQL (prod) |
| **ORM** | SQLAlchemy 2.0 (async) |
| **Auth** | JWT (python-jose + passlib) |
| **ML** | scikit-learn, XGBoost |
| **Charts** | Recharts (Web) / fl_chart (Flutter) |
| **Animations** | Framer Motion (Web), Flutter Animations |

---

## 📱 Platform Support

| Platform | Status | Notes |
|----------|--------|-------|
| **Web (Chrome/Edge)** | ✅ Ready | Both Next.js and Flutter Web |
| **Windows Desktop** | ✅ Ready | Requires Visual Studio C++ workload |
| **macOS Desktop** | ✅ Ready | Requires Xcode |
| **Android** | ✅ Ready | Requires Android SDK |
| **iOS** | ✅ Ready | Requires Xcode + macOS |

---

## 📁 Project Structure

```
StudentPulse/
├── backend/                # FastAPI backend
│   ├── app/
│   │   ├── core/           # Config, DB, Security
│   │   ├── auth/           # Authentication
│   │   ├── tracking/       # Daily activity tracking
│   │   ├── analytics/      # Analytics engine
│   │   ├── ml/             # ML burnout prediction
│   │   ├── gamification/   # XP, badges, streaks
│   │   └── main.py         # App entry point
│   └── requirements.txt
├── frontend/               # Next.js web dashboard
│   ├── src/app/            # Pages & routes
│   ├── src/components/     # Reusable components
│   └── src/lib/            # Utilities & API client
├── flutter_app/            # Cross-platform Flutter app
│   ├── lib/
│   │   ├── main.dart       # Entry point + window manager
│   │   ├── theme/          # Dark/Light neon theme system
│   │   ├── services/       # Platform-aware API client
│   │   ├── providers/      # Auth & theme state (Provider)
│   │   ├── utils/          # Responsive breakpoints
│   │   ├── widgets/        # GlassCard, NeonButton, PulseLoader, ThemeToggle
│   │   └── screens/        # All screens (see below)
│   ├── android/            # Android platform config
│   ├── ios/                # iOS platform config
│   ├── macos/              # macOS platform config
│   ├── windows/            # Windows platform config
│   └── web/                # Web platform config
└── README.md
```

---

## 🛠️ Setup

### Backend
```bash
cd backend
pip install -r requirements.txt
python -m app.ml.train       # Train ML model
uvicorn app.main:app --reload
```

### Web Frontend (Next.js)
```bash
cd frontend
npm install
npm run dev
```

### Flutter App (Cross-Platform)
```bash
cd flutter_app
flutter pub get

# Run on Web (Chrome)
flutter run -d chrome

# Run on Windows Desktop
flutter run -d windows

# Run on macOS Desktop
flutter run -d macos

# Run on Android
flutter run -d android

# Run on iOS
flutter run -d ios

# Build for production
flutter build web
flutter build windows
flutter build apk
flutter build macos
flutter build ios
```

---

## ✨ Features

- 📊 **Smart Daily Tracking** — Log sleep, study, gaming, mood, stress & more
- 🧠 **Burnout Prediction** — ML-powered burnout risk assessment
- 📈 **Productivity Dashboard** — Interactive charts & analytics
- 🏆 **Gamification** — XP, streaks, badges & achievements
- 👨‍👩‍👧 **Parent Monitoring** — Supportive wellness tracking
- 💡 **AI Recommendations** — Personalized wellness insights
- 🌙 **Futuristic UI** — Dark theme, glassmorphism, neon glow effects
- 📱 **Cross-Platform** — Windows, macOS, Android, iOS, Web
- 🖥️ **Responsive Design** — Sidebar on desktop, bottom nav on mobile
- 🔐 **Secure Auth** — JWT tokens with password strength validation

## 🏗️ Flutter App Architecture

```
Screens
├── Splash Screen          # Animated heartbeat logo, gradient branding
├── Auth Screen            # Login/Register with password rules
├── Dashboard Shell        # Responsive: sidebar (desktop) / bottom nav (mobile)
│   ├── Overview           # Stats cards, productivity chart, gamification
│   ├── Daily Tracker      # 12 metric sliders + mood picker → ML predict
│   ├── Burnout Analytics  # Gauge, risk factors, stress vs energy chart
│   ├── Productivity       # Bar chart, time distribution, grade
│   ├── Achievements       # Level, XP, streaks, badge grid
│   └── Profile            # User info, theme toggle, parent linking
└── Parent Dashboard       # Student monitoring, link code generation
```

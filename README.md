<p align="center">
  <img src="https://img.shields.io/badge/LEAKLENS-Cybersecurity%20SaaS-00FF88?style=for-the-badge&labelColor=080B12" alt="LeakLens" />
</p>

<h1 align="center">🔍 LEAKLENS</h1>

<p align="center">
  <strong>A Privacy-Focused Personal Data Exposure & Cyber Risk Intelligence Platform</strong>
</p>

<p align="center">
  <a href="https://leaklens-bay.vercel.app">🌐 Live Demo</a> •
  <a href="#features">✨ Features</a> •
  <a href="#tech-stack">🛠 Tech Stack</a> •
  <a href="#getting-started">🚀 Getting Started</a> •
  <a href="#screenshots">📸 Screenshots</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19.3-61DAFB?style=flat-square&logo=react&logoColor=white" />
  <img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Vite-8.x-646CFF?style=flat-square&logo=vite&logoColor=white" />
  <img src="https://img.shields.io/badge/FastAPI-0.137-009688?style=flat-square&logo=fastapi&logoColor=white" />
  <img src="https://img.shields.io/badge/Tailwind%20CSS-4.x-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" />
  <img src="https://img.shields.io/badge/Python-3.14-3776AB?style=flat-square&logo=python&logoColor=white" />
</p>

---

## 🎯 What is LeakLens?

**LeakLens** helps individuals and organizations understand their digital exposure, assess cybersecurity risks, monitor security indicators, and take proactive steps to improve their digital security posture.

> **Mission:** Make personal cybersecurity intelligence accessible, understandable, actionable, and privacy-conscious.

This is a **production-grade SaaS platform** — not a student project. It features a complete design system, premium glassmorphism UI, real backend functionality, secure JWT authentication with MFA, functional scanner modules, animated data visualizations, and a scalable architecture.

---

## ✨ Features

### 🛡️ Core Intelligence
| Module | Description |
|--------|-------------|
| **Email Exposure Scanner** | Scan email addresses for data breach exposure with animated radar visualization |
| **Username Intelligence** | Cross-platform username scanning with platform mention tracking |
| **Domain Security Audit** | SSL/TLS validation, DNS analysis, security header checks |
| **Phishing URL Analyzer** | Homoglyph detection, typosquatting analysis, URL pattern matching |
| **Threat Intelligence** | Multi-provider IOC lookup (VirusTotal, AbuseIPDB integration ready) |
| **Risk Assessment Engine** | Explainable 0-100 scoring with 6 weighted factors |

### 🎨 Premium UI/UX
- **Dark-first design** with premium glassmorphism and neon glow effects
- **Animated 3D Globe** on landing page (pure Canvas, no Three.js)
- **Particle Background** with floating connected dots
- **Radar Scanning Animation** during security assessments
- **Animated Charts** — risk gauge, exposure trend, distribution donut
- **Framer Motion** throughout — page transitions, staggered entrances, scroll-triggered reveals
- **Responsive** — desktop, tablet, mobile with collapsible sidebar & bottom nav
- **`prefers-reduced-motion`** respected globally

### 🔐 Security & Auth
- JWT authentication (access + refresh tokens)
- Two-Factor Authentication (TOTP with QR code)
- Recovery codes for 2FA backup
- Password strength meter with 4-criteria validation
- Email verification flow
- Password reset flow
- Active session management with revocation
- Role-based access control (User / Analyst / Admin / Super Admin)

### 💼 SaaS Architecture
- **4-tier subscription** — Free / Pro / Business / Enterprise
- Admin console with user management
- API access management with rate limiting
- Integration marketplace (VirusTotal, AbuseIPDB, Slack, Webhooks)
- Report generation with JSON export
- Notification center
- Continuous monitoring (Pro feature)
- Privacy center with GDPR-ready data controls

### 🤖 AI Security Assistant
- Chat interface with contextual security guidance
- Suggested questions for quick insights
- Pre-configured knowledge base (expandable with real AI)

---

## 🛠 Tech Stack

### Frontend
| Technology | Purpose |
|-----------|---------|
| **React 19** + **TypeScript** | UI framework with strict type safety |
| **Vite 8** | Lightning-fast build tool |
| **Tailwind CSS v4** | Utility-first styling with custom design tokens |
| **Framer Motion 14** | Advanced animations & page transitions |
| **Recharts 3** | Animated data visualizations |
| **React Router v6** | Client-side routing with lazy loading |
| **Zustand 5** | Lightweight state management |
| **TanStack React Query** | Server state management & caching |
| **Axios** | HTTP client with JWT interceptors |
| **Lucide React** | Beautiful icon system |
| **React Hot Toast** | Notification toasts |
| **React Helmet Async** | SEO meta tags |

### Backend
| Technology | Purpose |
|-----------|---------|
| **Python 3.14** + **FastAPI** | Async REST API |
| **SQLAlchemy 2.0** | Async ORM with SQLite (swappable to PostgreSQL) |
| **Pydantic v2** | Request/response validation |
| **python-jose** | JWT token management |
| **bcrypt** | Secure password hashing (Python 3.14 compatible) |
| **PyOTP** | TOTP-based 2FA |
| **httpx** | Async HTTP client for external APIs |
| **dnspython** | DNS resolution for domain scanning |
| **cryptography** | SSL/TLS certificate analysis |

---

## 📁 Project Structure

```
leaklens/
├── frontend/                    # React SPA
│   ├── src/
│   │   ├── components/
│   │   │   ├── charts/          # RiskGauge, AnimatedCounter, ExposureTrend, etc.
│   │   │   ├── effects/         # ParticleBackground, Globe, ScannerAnimation, etc.
│   │   │   ├── layout/          # Navbar, Sidebar, AppLayout, TopBar, Footer
│   │   │   ├── shared/          # Logo, RiskBadge, DataSourceBadge, PageTransition
│   │   │   └── ui/              # Button, Card, Input, Modal, Badge, Table, etc.
│   │   ├── hooks/               # useAuth, useTheme, useMediaQuery
│   │   ├── lib/                 # API client, utilities
│   │   ├── pages/
│   │   │   ├── admin/           # Admin Dashboard, User Management, Audit Logs
│   │   │   ├── app/             # Dashboard, Scanners, Reports, Settings (19 pages)
│   │   │   ├── auth/            # Login, Signup, MFA, Password Reset (7 pages)
│   │   │   └── marketing/       # Home, Features, Pricing, About, etc. (14 pages)
│   │   ├── stores/              # Zustand stores (auth, theme, notifications)
│   │   ├── types/               # TypeScript interfaces
│   │   ├── App.tsx              # Router with 40+ routes, lazy loading
│   │   ├── main.tsx             # App entry point
│   │   └── index.css            # Complete design system (340 lines)
│   ├── package.json
│   └── vite.config.ts
│
├── backend/                     # FastAPI REST API
│   ├── app/
│   │   ├── api/v1/endpoints/    # auth, scans, dashboard, domain, phishing, threat, user, extras
│   │   ├── core/                # config, database, security, dependencies, rate_limiter
│   │   ├── models/              # User, Assessment, Domain, Notification, Organization, Report, Threat
│   │   ├── schemas/             # Pydantic request/response models
│   │   ├── services/            # Risk engine, synthetic data generator
│   │   └── main.py              # FastAPI app with CORS, lifespan, health routes
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env.example
│
├── docker-compose.yml
├── .gitignore
├── LICENSE
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** ≥ 18
- **Python** ≥ 3.10
- **Git**

### Quick Start

```bash
# Clone the repository
git clone https://github.com/lakshaysoni22/Leak_Lens.git
cd Leak_Lens

# ── Backend Setup ──
cd backend
python -m venv venv
# Windows:
venv\Scripts\activate
# macOS/Linux:
# source venv/bin/activate

pip install -r requirements.txt
cp .env.example .env
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000

# ── Frontend Setup (new terminal) ──
cd frontend
npm install
npm run dev
```

### 🔐 Demo Login Credentials

> **⚠️ These credentials are required to log in to the demo application.**

| Field | Value |
|-------|-------|
| **Email** | `lakshaysoni@gmail.com` |
| **Password** | `123456789` |
| **Role** | Admin (full access to all features + admin panel) |

The demo user is automatically created when the backend starts. Login at `/auth/login` to access the dashboard.

Open **http://localhost:5173** in your browser.

### Environment Variables

Copy `backend/.env.example` to `backend/.env` and configure:

```env
SECRET_KEY=your-secret-key-change-this
DATABASE_URL=sqlite+aiosqlite:///./leaklens.db
DEBUG=true

# Optional: External API integrations
VIRUSTOTAL_API_KEY=
ABUSEIPDB_API_KEY=
```

---

## 🐳 Docker

```bash
docker-compose up --build
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- Health Check: http://localhost:8000/health

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/auth/register` | Create new account |
| `POST` | `/api/v1/auth/login` | Authenticate & get JWT |
| `POST` | `/api/v1/auth/mfa/setup` | Setup 2FA |
| `POST` | `/api/v1/scans/email` | Scan email for exposures |
| `POST` | `/api/v1/scans/username` | Scan username |
| `POST` | `/api/v1/domain/scan` | Domain security audit |
| `POST` | `/api/v1/phishing/analyze` | Analyze URL for phishing |
| `POST` | `/api/v1/threat-intel/lookup` | IOC threat lookup |
| `GET`  | `/api/v1/dashboard/overview` | Dashboard stats & charts |
| `GET`  | `/api/v1/scans/history` | Scan history (paginated) |
| `GET`  | `/health` | Service health check |

Full API documentation available at `http://localhost:8000/docs` (Swagger UI).

---

## 🎨 Design System

| Token | Value | Usage |
|-------|-------|-------|
| Primary BG | `#080B12` | Main background |
| Secondary BG | `#0D1220` | Cards, sections |
| Surface | `#111827` | Elevated surfaces |
| Accent Green | `#A3FF6F` | Primary accent, CTAs, positive indicators |
| Accent Cyan | `#45D6FF` | Secondary accent, links |
| Accent Purple | `#8B7CFF` | Tertiary accent, premium features |
| Text Primary | `#F5F7FA` | Headings, body text |
| Text Secondary | `#929BAD` | Supporting text |
| Critical | `#FF5A5A` | Critical risk indicators |
| Warning | `#FFB547` | High risk, warnings |

---

## ⚠️ Important Notes

- **Synthetic Data**: All scan results use synthetic/demo data for demonstration purposes. No real breach databases are queried. Results are clearly labeled with a "Synthetic Data" badge.
- **Privacy First**: No real personal data is stored or processed without consent.
- **API Keys**: External integrations (VirusTotal, AbuseIPDB) require API keys configured in `.env`.
- **Database**: Uses SQLite by default. Swap to PostgreSQL for production by changing `DATABASE_URL`.

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  Built with 🛡️ by <a href="https://github.com/lakshaysoni22">Lakshay Soni</a>
</p>

<p align="center">
  <sub>LeakLens — Your Digital Footprint. Your Security. Your Control.</sub>
</p>

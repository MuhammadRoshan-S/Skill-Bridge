<div align="center">

# 🌉 SkillBridge
### *AI-Powered Career Operating System & Skill-Gap Analysis Platform*

[![Python](https://img.shields.io/badge/Python-3.11%2B-blue.svg?logo=python&logoColor=white)](https://www.python.org/)
[![Django](https://img.shields.io/badge/Django-5.2%2B-092E20.svg?logo=django&logoColor=white)](https://www.djangoproject.com/)
[![DRF](https://img.shields.io/badge/Django_REST-Framework-red.svg)](https://www.django-rest-framework.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB.svg?logo=react&logoColor=black)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-8.2-646CFF.svg?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Gemini](https://img.shields.io/badge/Google_Gemini-2.0_Flash-8E75B2.svg?logo=google&logoColor=white)](https://deepmind.google/technologies/gemini/)
[![JWT](https://img.shields.io/badge/Auth-SimpleJWT-black.svg?logo=jsonwebtokens)](https://jwt.io/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

<p align="center">
  <b>Transform your resume into your dream career.</b><br>
  SkillBridge extracts competencies, identifies skill deficiencies against real-world roles, generates tailored step-by-step learning roadmaps, recommends skill-matched job openings, and trains you with interactive AI mock interviews.
</p>

[✨ Live Demo Credentials](#-1-click-instant-demo) •
[🚀 Quick Start](#-quick-start-guide) •
[🧠 Core Features](#-key-features) •
[📐 Architecture](#-system-architecture) •
[📡 API Reference](#-api-endpoints-reference)

---

</div>

## 📖 Overview

**SkillBridge** is a full-stack career acceleration platform engineered to eliminate guesswork from technical job preparation. 

Traditional job seeking leaves applicants wondering why their resumes fail ATS filters and what specific competencies they lack. SkillBridge leverages modern Large Language Models (**Google Gemini**) to parse resumes, benchmark candidates against target industry positions, deliver customized multi-week learning curricula, and conduct real-time AI mock interviews with automated scoring.

---

## 🧠 Key Features

```
               ┌────────────────────────────────────────────────────────┐
               │                  SkillBridge Engine                    │
               └──────────────────────────┬─────────────────────────────┘
                                          │
    ┌──────────────────┬──────────────────┼──────────────────┬──────────────────┐
    ▼                  ▼                  ▼                  ▼                  ▼
📄 ATS Resume      🎯 Skill-Gap        🗺️ AI Learning      💼 Smart Job       🎙️ AI Mock
   Analysis           Benchmarking       Roadmap              Matching           Interview
```

### 1. 📄 ATS Resume Analyzer & Parser
- **Multi-Format Ingestion**: Upload `.pdf` or `.docx` resumes with automated text sanitization and parsing.
- **Tri-Factor Scoring Matrix**: Evaluates Content (40%), Formatting (30%), and Impact/Action Verbs (30%) alongside an overall ATS Score.
- **Deep Entity Extraction**: Classifies technical and soft skills into a structured database taxonomy.
- **Actionable Critique**: Pinpoints missing quantifiable metrics, weak formatting, and suggested bullet rewrites.

### 2. 🎯 Dynamic Skill-Gap Benchmarking
- **Role Benchmarking**: Compares extracted candidate skillsets against target industry roles (e.g., Full-Stack Engineer, DevOps Architect, AI/ML Specialist).
- **Competency Matrix**: Visualizes matched strengths vs. missing high-priority skills.
- **Readiness Rating**: Real-time score indicator computing candidate viability for selected roles.

### 3. 🗺️ AI-Generated Learning Roadmaps
- **Customized Curricula**: Generates multi-milestone learning pathways structured by weeks or competency levels.
- **Curated Learning Resources**: Delivers specific documentation links, recommended courses, and project-based assignments.
- **Milestone Telemetry**: Interactive progress checkboxes with integrated celebration triggers (**Canvas Confetti**).

### 4. 💼 Skill-Matched Job Board
- **Match-Percentage Ranking**: Orders active job postings based on real-time candidate skill overlap.
- **Deep Filtering**: Filter by role title, seniority level, salary band, and remote/onsite status.
- **Direct Application Tracking**: Track application states and required qualifications.

### 5. 🎙️ Interactive AI Mock Interviewer
- **Context-Aware Questioning**: Generates technical and situational questions tailored to the candidate's target job role and experience.
- **Dynamic Hints**: On-demand guidance hints to structure optimal answers without giving away solutions.
- **Instant AI Grading**: Grades responses across relevance, technical depth, and communication clarity with instant constructive feedback.

### 6. 📊 Career Command Center & Telemetry
- **Aggregated Analytics**: Central dashboard showing ATS readiness, active roadmap velocity, interview practice scores, and recommended jobs.
- **Printable Career Report**: Exportable summary of candidate readiness for mentors and recruiters.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, Vite, JavaScript (ES6+), React Router v7, Lucide Icons, Canvas Confetti |
| **Styling & UI** | Custom CSS3 Design System, Glassmorphism, Cyber Midnight Dark Palette, CSS Variables, Responsive Grid/Flexbox |
| **Backend Framework**| Python 3.11+, Django 5.2, Django REST Framework (DRF) |
| **Authentication** | Django SimpleJWT (Access/Refresh Token Rotation) |
| **AI / LLM Engine** | Google Gemini 2.0 Flash (`google-generativeai`) with resilient heuristic offline fallback |
| **File Parsing** | `PyPDF2`, `python-docx`, `Pillow` |
| **Database** | SQLite (Default Dev) / PostgreSQL ready (`psycopg2-binary`, `dj-database-url`) |
| **Tooling & Linter** | Vite, Oxlint, Git, PowerShell / Bash |

---

## 📐 System Architecture

```mermaid
graph TD
    A[User / Client] -->|HTTP / JSON| B[React 19 Frontend - Vite]
    B -->|REST Requests + JWT| C[Django 5.2 REST API]
    
    subgraph Django Backend
        C --> D[Auth & Profile Module]
        C --> E[Resume Parser & ATS Engine]
        C --> F[Skill Taxonomy & Gap Analyzer]
        C --> G[Roadmap & Milestone Tracker]
        C --> H[Mock Interview Engine]
        C --> I[Job Recommendation Board]
    end
    
    subgraph Data & AI Infrastructure
        E -->|Extract Text| J[PyPDF2 / python-docx]
        E & F & G & H -->|Prompt Payload| K[AI Service Layer]
        K -->|API Request| L[Google Gemini 2.0 Flash]
        K -.->|Offline Fallback| M[Heuristic Mock Engine]
        C -->|ORM Queries| N[(SQLite / PostgreSQL)]
    end
```

---

## 📁 Repository Structure

```text
SkillBridge/
├── backend/
│   ├── ai_service/             # Gemini API client, prompts & fallback evaluators
│   ├── users/                  # Custom user profiles & JWT authentication endpoints
│   ├── resumes/                # File upload handler, PyPDF2 parser & ATS score engine
│   ├── skills/                 # Skill taxonomy, job role catalog & gap analysis
│   ├── jobs/                   # Job listings with skill match calculation
│   ├── roadmap/                # Personalized curriculum generator & progress models
│   ├── interviews/             # Mock interview sessions & AI answer evaluation
│   ├── dashboard/              # Aggregated career analytics endpoint
│   ├── skillbridge/            # Django root settings, WSGI/ASGI, URLs & CORS config
│   ├── seed_data.py            # Comprehensive database seeder (Demo users, roles, jobs)
│   ├── requirements.txt        # Python backend dependencies
│   └── manage.py               # Django management script
│
└── frontend/
    ├── public/                 # Static assets & favicon
    ├── src/
    │   ├── components/
    │   │   ├── charts/         # ProgressRing, StatCard, Visual gauges
    │   │   ├── common/         # Button, Card, Input, Modal, Badge, ProgressBar
    │   │   └── layout/         # Glassmorphic Sidebar, Navbar, PageLayout wrapper
    │   ├── context/            # AuthContext (JWT persistence, user profile state)
    │   ├── pages/              # 12 SaaS pages (Dashboard, Resume, Gap, Roadmap, etc.)
    │   ├── services/           # Axios instance with auto token-refresh interceptors
    │   ├── index.css           # Modern Cyber-Midnight CSS design tokens & animations
    │   ├── App.jsx             # React Router routing & ProtectedRoute guards
    │   └── main.jsx            # React root mount
    ├── index.html              # HTML5 entrypoint
    ├── vite.config.js          # Vite build & proxy configuration
    └── package.json            # Frontend dependencies & scripts
```

---

## ⚡ Quick Start Guide

### Prerequisites
- **Python 3.11+** installed ([python.org](https://www.python.org/downloads/))
- **Node.js 18+** and **npm** installed ([nodejs.org](https://nodejs.org/))
- *(Optional)* **Google Gemini API Key** ([Google AI Studio](https://aistudio.google.com/))

---

### 1. Backend Setup

```bash
# 1. Navigate to backend directory
cd backend

# 2. (Optional) Create & activate a virtual environment
python -m venv venv
# Windows:
.\venv\Scripts\activate
# macOS / Linux:
source venv/bin/activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Configure environment variables (Optional, defaults work out of the box)
# Create a .env file if you wish to use your own Gemini API Key:
# GEMINI_API_KEY=your_gemini_api_key_here

# 5. Run database migrations
python manage.py migrate

# 6. Seed demo data (Pre-populates job roles, skills, learning paths & demo user)
python seed_data.py

# 7. Start Django development server
python manage.py runserver 127.0.0.1:8000
```
> The Django backend will run at `http://127.0.0.1:8000/`.

---

### 2. Frontend Setup

```bash
# Open a new terminal tab/window
cd frontend

# 1. Install NPM packages
npm install

# 2. Start Vite development server
npm run dev
```
> The React frontend will run at `http://127.0.0.1:5173/`.

---

## ⚡ 1-Click Instant Demo

For instant evaluation without filling out registration forms:

1. Open `http://127.0.0.1:5173/` in your browser.
2. Click the **"⚡ 1-Click Demo"** button on the landing page or login page.
3. Pre-configured demo credentials:
   - **Username**: `demouser`
   - **Password**: `demo12345`

---

## 📡 API Endpoints Reference

### 🔐 Authentication & Profile (`/api/auth/` & `/api/profile/`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|:---:|
| `POST` | `/api/auth/register/` | Register new user account | No |
| `POST` | `/api/auth/login/` | Obtain JWT access and refresh token pair | No |
| `POST` | `/api/auth/token/refresh/` | Refresh expired access token | No |
| `GET` | `/api/profile/` | Fetch authenticated user's profile | Yes |
| `PATCH` | `/api/profile/` | Update target role, aspirations, and experience | Yes |

### 📄 Resumes & ATS Scoring (`/api/resumes/`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|:---:|
| `POST` | `/api/resumes/upload/` | Upload `.pdf` or `.docx` resume and run AI analysis | Yes |
| `GET` | `/api/resumes/latest/` | Get most recent parsed resume and ATS score audit | Yes |
| `GET` | `/api/resumes/` | List all historical resume submissions | Yes |

### 🎯 Skill Gap & Benchmarks (`/api/skills/`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|:---:|
| `GET` | `/api/skills/roles/` | List all industry job roles and required skillsets | Yes |
| `GET` | `/api/skills/gap-analysis/` | Run gap analysis comparing profile against target role | Yes |
| `POST` | `/api/skills/user-skills/` | Add/update verified skills manually | Yes |

### 🗺️ Roadmaps & Learning Resources (`/api/roadmap/`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|:---:|
| `GET` | `/api/roadmap/current/` | Fetch active user learning roadmap | Yes |
| `POST` | `/api/roadmap/generate/` | Trigger AI generation of a new milestone roadmap | Yes |
| `PATCH` | `/api/roadmap/milestones/<id>/toggle/` | Toggle completion status of a milestone | Yes |

### 🎙️ AI Mock Interviews (`/api/interviews/`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|:---:|
| `POST` | `/api/interviews/sessions/start/` | Initiate interview session for a target role | Yes |
| `GET` | `/api/interviews/sessions/<id>/` | Fetch session details, questions & hints | Yes |
| `POST` | `/api/interviews/evaluate/` | Submit answer for instant AI grading and feedback | Yes |

### 💼 Jobs & Dashboard Telemetry (`/api/jobs/` & `/api/dashboard/`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|:---:|
| `GET` | `/api/jobs/` | Get list of jobs with dynamic skill match % | Yes |
| `GET` | `/api/dashboard/` | Aggregated dashboard stats (ATS, gap, roadmap, jobs) | Yes |

---

## ⚙️ Environment Variables

Create a `backend/.env` file to customize settings:

```env
# Django Security
SECRET_KEY=your-custom-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# AI Model Configuration
GEMINI_API_KEY=your-gemini-api-key-here
GEMINI_MODEL=gemini-2.0-flash

# Database (Optional - Defaults to SQLite if omitted)
# DATABASE_URL=postgres://user:password@host:5432/dbname

# CORS Allowed Origins
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

---

## 🎨 Design System & UI Principles

SkillBridge features a modern **Cyber-Midnight / Glassmorphic** design:
- **Palette**: Dark slate backgrounds (`#0B0F19`, `#111827`) paired with electric indigo (`#6366F1`), cyan (`#06B6D4`), and emerald accent highlights.
- **Glassmorphism**: Backdrop blur overlays (`rgba(255, 255, 255, 0.05)`) with subtle hairline border styling.
- **Typography**: Clean, high-legibility geometric sans-serif type hierarchy.
- **Micro-Interactions**: Hover lifts, smooth spring transitions, progress ring meters, and celebration particles.

---

## 🤝 Contributing

Contributions are warmly welcomed! To contribute:

1. **Fork the Repository**
2. **Create a Feature Branch**:
   ```bash
   git checkout -b feature/AmazingFeature
   ```
3. **Commit your Changes**:
   ```bash
   git commit -m "Add AmazingFeature"
   ```
4. **Push to the Branch**:
   ```bash
   git push origin feature/AmazingFeature
   ```
5. **Open a Pull Request**

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for more information.

---

<div align="center">
  <sub>Built with ❤️ by the SkillBridge Team. If you find this project helpful, please give it a ⭐️ on GitHub!</sub>
</div>

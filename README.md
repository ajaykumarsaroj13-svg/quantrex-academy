# Quantrex Academy — Premium Secure IIT-JEE Math Ecosystem

Quantrex Academy is a complete premium, futuristic, and highly secure EdTech ecosystem for IIT-JEE Mathematics coaching, founded by **A.K. Sir (Ajay Kumar Saroj)**. It features student portals, robust administrative controls, custom watermarked video playback, secure diagonal watermarked PDF note loaders, and JEE Advanced exam simulators.

---

## Technical Architecture & Brand Scheme

### Theme Specs:
- **Background Obsidian:** `#0B0C10`
- **Accent (Electric Blue):** `#00F0FF`
- **Branding (Gold):** `#FFD700`
- **Accent Panels (Cyberdark):** `#1F2833`
- **Typography:** Orbitron (display headings) & Inter (body text)

---

## Directory Structure

```
quantrex-academy/
├── package.json               # Root scripts to run frontend and backend
├── README.md                  # System Documentation & Guides
├── backend/                   # Node.js + Express + Socket.io Server
│   ├── package.json           # Backend package configuration
│   └── server.js              # API endpoints, Socket triggers, AI mentor
└── frontend/                  # React Single Page App (Vite + Tailwind CSS)
    ├── package.json
    ├── vite.config.js         # Port mapping & proxy config
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── index.html
    └── src/
        ├── main.jsx           # Mount entrypoint
        ├── App.jsx            # Core routing & state coordinator
        ├── index.css          # Glow utilities and animations
        ├── components/
        │   ├── Navbar.jsx
        │   ├── MathCanvas.jsx # HTML5 Interactive graph visualizer
        │   ├── VideoPlayer.jsx# Anti-screenshot watermarked player
        │   └── PdfViewer.jsx  # Protected print-blocked notes loader
        └── pages/
            ├── Home.jsx       # Cinematic landing page & checkout portal
            ├── Auth.jsx       # OTP mobile & Admin 2FA portals
            ├── StudentDashboard.jsx # Analytics, leaderboard, AI solver
            ├── AdminDashboard.jsx # Course uploader, student banning, logs
            └── TestSystem.jsx # JEE Advanced test player & auto-result
```

---

## Local Installation Guide

### Prerequisites
1. Install [Node.js](https://nodejs.org) (v18 or higher recommended).

### Steps
1. Navigate into the root folder:
   ```bash
   cd C:\Users\Admin\.gemini\antigravity\scratch\quantrex-academy
   ```
2. Install all dependencies across root, frontend, and backend packages:
   ```bash
   npm run install-all
   ```
3. Run both the backend API server (port `5000`) and the Vite React frontend (port `3000`) concurrently:
   ```bash
   npm run dev
   ```
4. Access the portal at [http://localhost:3000](http://localhost:3000).

---

## Security System Specifications

### 1. Video Protection Ecosystem:
- **Watermark:** A custom HTML5 layout layers a random moving transparent canvas overlay containing the student's Name, Phone, and IP Address.
- **Inspect Block:** Right-clicks, `F12`, `Ctrl+Shift+I`, and `Ctrl+U` keyboard hotkeys are intercepted to pause play and log telemetry alerts.
- **Focus Detection:** Losing browser window focus blurs video elements to prevent desktop capture tools from leaking frames.

### 2. PDF Protection Ecosystem:
- **Watermark:** Repetitive diagonal text containing user credentials prevents phone photography leaks.
- **Print Lock:** Overrides standard browser `Ctrl+P` and uses `@media print` directives to hide notes text. Text selection copy operations are disabled.

### 3. Session Security:
- **Single Login:** Student logins check active user sessions, clearing past device tokens to enforce single concurrent device sessions.

---

## Payment Flow Integration

1. A student clicks "Enroll Now" on a course card.
2. A secure popup prompts payment provider choices (Razorpay or Stripe).
3. The checkout verifies transactions using backend endpoint `/api/payments/checkout`.
4. Digital signatures are checked, granting immediate course flags in the user's dashboard.

---

## Deployment & Hosting Setup

### Frontend: Vercel Hosting
1. Install the Vercel CLI: `npm install -g vercel`.
2. Navigate to `frontend/` directory:
   ```bash
   cd frontend
   ```
3. Run `vercel` to initialize and deploy the static app.
4. Setup environment variables (API endpoints proxy settings) in the Vercel dashboard.

### Backend: Render or AWS Elastic Beanstalk
1. Push the repository to GitHub.
2. Link the repository to a Render web service.
3. Configure start command: `npm install && node server.js`.
4. Expose the environment variable `PORT=5000` and set MongoDB Atlas connection strings.

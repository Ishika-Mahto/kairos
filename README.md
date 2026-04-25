# KAIROS — AI Decision Intelligence

KAIROS is an AI-powered decision workspace that helps you forecast friction, track execution patterns, and act with clarity. Describe what you're about to do, and KAIROS returns a single clear next move backed by your own behavioral history.

---

## Features

- **Decision Dashboard** — Submit any decision and get an AI-generated prediction, consequence analysis, and immediate action step
- **Execution Tracker** — Log completed and missed tasks, mark recoveries, and track your streak
- **Behavior Insights** — Visual breakdown of your patterns, success rate, peak performance hours, and execution risk
- **Local-first auth** — Accounts and sessions stored in localStorage, no backend auth required
- **CSV & JSON export** — Download your full task history or back up your entire workspace

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, React Router v6, Vite |
| Backend | Node.js, Express |
| AI | Google Gemini API (`gemini-2.5-flash`) |
| Styling | Custom CSS (dark theme, glassmorphism) |
| Storage | localStorage (client) + JSON file (server) |

---

## Getting Started

### Prerequisites

- Node.js 18+
- A [Google Gemini API key](https://aistudio.google.com/app/apikey)

### Installation

```bash
# Clone the repo
git clone https://github.com/your-username/kairos.git
cd kairos

# Install dependencies
npm install
```

### Environment Setup

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Then fill in your values:

```env
PORT=5000
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash
```

### Running Locally

You need two terminals running simultaneously.

**Terminal 1 — Backend**
```bash
node server.js
```

**Terminal 2 — Frontend**
```bash
npm run dev
```

Then open [http://localhost:5173](http://localhost:5173) in your browser.

> The Vite dev server proxies all API requests to the backend automatically — no CORS issues.

---

## Project Structure

```
kairos/
├── controllers/        # Express route handlers
├── routes/             # API route definitions
├── services/           # Gemini AI + task history logic
├── data/               # Persisted task history (JSON)
├── src/
│   ├── components/     # Reusable UI components
│   ├── context/        # Auth state (React Context)
│   ├── hooks/          # Custom hooks (keyboard shortcuts)
│   ├── pages/          # Dashboard, Tracker, Insights, Auth pages
│   ├── services/       # Frontend API client
│   └── utils/          # Feature logic, storage, dashboard helpers
├── server.js           # Express entry point
├── vite.config.js      # Vite + proxy config
└── .env.example        # Environment variable template
```

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/analyze` | Analyze a decision with Gemini AI |
| `POST` | `/track` | Log a new task entry |
| `PATCH` | `/track/:id/complete` | Mark a missed task as recovered |
| `GET` | `/history` | Fetch recent task history |

---

## Deployment

For production, build the frontend and serve it from the Express backend or a static host.

```bash
# Build the frontend
npm run build

# Start the backend
node server.js
```

Set your environment variables on your hosting platform (Render, Railway, Vercel, etc.) — never commit your `.env` file.

---

## License

MIT

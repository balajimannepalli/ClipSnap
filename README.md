# ClipSnap

A secure, minimal, production-ready **real-time online clipboard** built with MERN stack and Socket.IO.

![ClipSnap](https://img.shields.io/badge/version-1.0.0-green) ![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen) ![License](https://img.shields.io/badge/license-MIT-blue)

## Features

- ✅ **Real-time sync** — Creator edits appear instantly for all viewers
- ✅ **Auto-copy** — Viewers automatically get content copied to clipboard
- ✅ **Auto-expire** — Clips expire 15 minutes after last access/edit
- ✅ **Anonymous** — No signup required, creator identified via browser token
- ✅ **Secure** — Creator-only editing, rate limiting, size limits
- ✅ **Portable** — Short clipboard IDs for easy sharing

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React + Vite + Tailwind CSS |
| Backend | Node.js + Express + Socket.IO |
| Database | MongoDB (with TTL index) |
| Hosting | Vercel (frontend) + Render (backend) |

## Quick Start

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd ClipSnap

# Install all dependencies
npm run install:all
```

### Configuration

1. Create server environment file:

```bash
cd server
cp .env.example .env
```

2. Edit `.env` with your MongoDB URI:

```env
PORT=3001
MONGO_URI=mongodb://localhost:27017/clipsnap
FRONTEND_ORIGIN=http://localhost:5173
BCRYPT_SALT_ROUNDS=10
CLIP_TTL_SECONDS=900
```

### Running Locally

```bash
# From root directory - runs both client and server
npm run dev
```

Or run separately:

```bash
# Terminal 1: Server
cd server && npm run dev

# Terminal 2: Client
cd client && npm run dev
```

**Access the app at:** http://localhost:5173

## Project Structure

```
ClipSnap/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Toast, CopyButton, DownloadButton
│   │   ├── context/        # ToastContext
│   │   ├── hooks/          # useClipboard, useSocket
│   │   ├── pages/          # Landing, CreateClip, ClipView
│   │   ├── utils/          # api.js, storage.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
├── server/                 # Express backend
│   ├── src/
│   │   ├── db/             # MongoDB connection
│   │   ├── middleware/     # Rate limiter, size validator
│   │   ├── models/         # Clip model with TTL
│   │   ├── routes/         # REST API routes
│   │   ├── socket/         # Socket.IO handlers
│   │   ├── utils/          # ID generator
│   │   └── index.js
│   └── package.json
├── docs/                   # Documentation
│   ├── deploy.md
│   ├── security.md
│   └── qa.md
├── DECISIONS.md            # Design tradeoffs
└── README.md
```

## API Reference

### REST Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/clip` | Create new clip |
| GET | `/api/clip/:id` | Get clip (resets TTL) |
| GET | `/api/clip/:id/meta` | Get clip metadata |
| POST | `/api/clip/:id/edit` | Edit clip (fallback) |

### Socket.IO Events

| Event | Direction | Description |
|-------|-----------|-------------|
| `join-room` | C→S | Join clipboard room |
| `room-data` | S→C | Initial room data |
| `client-edit` | C→S | Creator edit |
| `server-edit` | S→C | Broadcast edit |

## Deployment

See [docs/deploy.md](docs/deploy.md) for detailed instructions on deploying to:
- **Frontend:** Vercel
- **Backend:** Render

## Security

See [docs/security.md](docs/security.md) for security considerations and limitations.

## Testing

See [docs/qa.md](docs/qa.md) for the QA checklist and test procedures.

```bash
# Run server tests
npm test

# Run integration tests
npm run test:integration
```

## License

MIT

# CALLU

**CALLU** is a private, invite-only community platform for professionals, creators, and visionaries. It provides high-fidelity voice and video calls, collaborative rooms with real-time chat and a synchronized music player, and a curated member directory — all within an exclusive, manually-reviewed network.

---

## Repositories & Sync

- **This repo (`sanks011/callu`)** is the **web + server** version.
- **Desktop app (Electron)** lives at: https://github.com/Sahnik0/callu

To keep both apps in sync, we recommend a shared root folder like:

```
Callu/
├── callu/          # Web + server (this repo)
└── callu-desktop/  # Electron app (Sahnik0/callu)
```

### Desktop app API URL

In the Electron app, set:

```
VITE_API_URL=https://callu.up.railway.app
```

For local development, run this server locally and change `VITE_API_URL` to your local URL (for example `http://localhost:3000`).

---

## Features

- **Curated Access** — Applications are reviewed manually; fewer than 1% of applicants are accepted, ensuring a high-trust environment.
- **OTP Authentication** — Members log in with a one-time code sent to their verified email address via Mailjet. No passwords to remember or leak.
- **1-on-1 Voice & Video Calls** — Peer-to-peer calls powered by WebRTC (SimplePeer) with real-time signaling over Socket.IO.
- **Community Rooms** — Multi-participant voice/video rooms featuring:
  - Screen sharing
  - Real-time text chat with file attachments (stored via ImageKit, auto-expired)
  - Synchronized music player (YouTube-sourced, queue-based, host-controlled)
- **Live Presence** — See which members are currently online, updated in real time.
- **Admin Dashboard** — Manage applicants (approve / reject), view members, and oversee the community.
- **Settings & Wallet** — Member profile customization and wallet management.
- **Custom Context Menus & Smooth Scrolling** — Polished UX with Lenis smooth scroll and contextual right-click menus.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 16](https://nextjs.org) (App Router) + TypeScript |
| UI | React 19, Tailwind CSS v4, Framer Motion, Lenis, Lottie, Lucide React |
| Real-time | [Socket.IO](https://socket.io) (server + client) |
| Video/Voice | [SimplePeer](https://github.com/feross/simple-peer) (WebRTC) |
| Database | [MongoDB](https://www.mongodb.com) via [Mongoose](https://mongoosejs.com) |
| Email / OTP | [Mailjet](https://www.mailjet.com) (transactional email API) |
| File Storage | [ImageKit](https://imagekit.io) |
| Music | [YouTube IFrame API](https://developers.google.com/youtube/iframe_api_reference) via react-youtube |
| Notifications | [Sonner](https://sonner.emilkowal.ski) (toast notifications) |
| Deployment | [Railway](https://railway.app) / [Render](https://render.com) |

---

## Prerequisites

- **Node.js** ≥ 18
- **npm** ≥ 9
- A running **MongoDB** instance (local or Atlas)
- A **Mailjet** account with API Key and Secret (for OTP emails)
- *(Optional)* An **ImageKit** account for room chat file attachments

---

## Local Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/sanks011/callu.git
   cd callu
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment variables**

   Create a `.env` file in the project root (see [Environment Variables](#environment-variables) below).

4. **Start the development server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Environment Variables

Create a `.env` file at the root of the project with the following variables:

```env
# MongoDB
MONGODB_URI=

# App URL (use http://localhost:3000 for local development)
NEXT_PUBLIC_URL=https://callu.up.railway.app

# Server
PORT=10000

# Admin credentials
ADMIN_ID=
ADMIN_PASSWORD=
ADMIN_SECRET=

# Mailjet (transactional email / OTP)
MAILJET_API_KEY=
MAILJET_API_SECRET=
MAILJET_FROM_EMAIL=
MAILJET_FROM_NAME=CALLU

# ImageKit (optional — room chat file attachments)
IMAGEKIT_PRIVATE_KEY=
IMAGEKIT_PUBLIC_KEY=
IMAGEKIT_URL_ENDPOINT=
```

> **Note:** Set `NEXT_PUBLIC_URL` to `http://localhost:3000` for local development.  
> **Note:** `IMAGEKIT_*` variables are optional. If omitted, room chat file attachments and automatic cleanup of expired uploads are disabled.  
> **Note:** `ADMIN_ID` and `ADMIN_PASSWORD` are the credentials used to access the `/admin` dashboard.

---

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the development server with hot-reload (via nodemon + ts-node) |
| `npm run build` | Build the Next.js app and compile the custom server for production |
| `npm start` | Run the production server (requires `npm run build` first) |

---

## Project Structure

```
callu/
├── app/                  # Next.js App Router pages and API routes
│   ├── admin/            # Admin dashboard (applicants, members)
│   ├── api/              # REST API routes
│   │   ├── auth/         # OTP login & session management
│   │   ├── apply/        # Application submission
│   │   ├── calls/        # Call history & signaling
│   │   ├── rooms/        # Room management
│   │   ├── users/        # Member directory
│   │   ├── notify/       # Push/email notifications
│   │   ├── youtube/      # YouTube proxy for music player
│   │   └── health/       # Health check endpoint
│   ├── dashboard/        # Member dashboard
│   │   ├── calls/        # Call history
│   │   ├── members/      # Member directory & presence
│   │   ├── rooms/        # Community rooms & room pages
│   │   ├── settings/     # Profile settings
│   │   └── wallet/       # Wallet management
│   ├── login/            # OTP login page
│   └── page.tsx          # Landing page
├── components/           # Shared React components
│   ├── CallManager.tsx   # WebRTC call management (1-on-1 calls)
│   ├── RoomMusicPlayer.tsx # Synchronized YouTube music player
│   ├── DashboardSidebar.tsx # Sidebar navigation with presence
│   ├── ApplyModal.tsx    # Application form modal
│   ├── CustomContextMenu.tsx # Right-click context menus
│   └── ...               # Other UI components
├── context/              # React context providers (auth, …)
├── lib/                  # Server-side utilities (DB, email, config)
├── models/               # Mongoose models
│   ├── User.ts           # Member model
│   ├── Room.ts           # Room model
│   ├── CallLog.ts        # Call history
│   ├── LoginOtp.ts       # OTP tokens
│   ├── LoginSession.ts   # Session management
│   └── RoomChatUpload.ts # Room chat file metadata
├── public/               # Static assets
├── server.ts             # Custom Node.js + Socket.IO server entry point
├── seed.ts               # Database seeding script
├── render.yaml           # Render deployment configuration
└── next.config.ts        # Next.js configuration
```

---

## Deployment

### Railway (recommended)

1. Push your code to GitHub.
2. Create a new project on [Railway](https://railway.app) and connect your repository.
3. Set **Build Command**: `npm install && npm run build`
4. Set **Start Command**: `npm start`
5. Add all required [Environment Variables](#environment-variables) in the Railway dashboard.

### Render

The project also ships with a `render.yaml` for deployment on [Render](https://render.com).

1. Push your code to GitHub.
2. Create a new **Web Service** on Render and connect your repository.
3. Render will automatically detect `render.yaml` and use the configured build and start commands.
4. Add all required [Environment Variables](#environment-variables) in the Render dashboard under **Environment**.

---

## Contributing

Contributions are welcome! For **large features**, please start a discussion first to gather feedback from maintainers and clarify scope before proceeding. For smaller fixes, open an issue or pull request directly. Make sure `npm run lint` passes before submitting.

Pull requests should follow the template in `.github/pull_request_template.md`, include a `Fixes #<issue-number>` reference, and use a conventional PR title such as `fix: short summary`.

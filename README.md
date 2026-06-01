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
- **OTP Authentication** — Members log in with a one-time code sent to their verified email address. No passwords to remember or leak.
- **1-on-1 Voice & Video Calls** — Peer-to-peer calls powered by WebRTC (SimplePeer) with real-time signaling over Socket.IO.
- **Community Rooms** — Multi-participant voice/video rooms featuring:
  - Screen sharing
  - Real-time text chat with file attachments (stored via ImageKit, auto-expired)
  - Synchronized music player (YouTube-sourced, queue-based, host-controlled)
- **Live Presence** — See which members are currently online, updated in real time.
- **Admin Dashboard** — Manage applicants (approve / reject), view members, and oversee the community.
- **Settings & Wallet** — Member profile customization and wallet management.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 16](https://nextjs.org) (App Router) + TypeScript |
| UI | React 19, Tailwind CSS v4, Framer Motion, Lenis |
| Real-time | [Socket.IO](https://socket.io) (server + client) |
| Video/Voice | [SimplePeer](https://github.com/feross/simple-peer) (WebRTC) |
| Database | [MongoDB](https://www.mongodb.com) via [Mongoose](https://mongoosejs.com) |
| Email / OTP | [Nodemailer](https://nodemailer.com) (SMTP / Gmail) |
| File Storage | [ImageKit](https://imagekit.io) |
| Music | [YouTube IFrame API](https://developers.google.com/youtube/iframe_api_reference) via react-youtube |
| Deployment | [Render](https://render.com) |

---

## Prerequisites

- **Node.js** ≥ 18
- **npm** ≥ 9
- A running **MongoDB** instance (local or Atlas)
- A **Gmail** account with an [App Password](https://support.google.com/accounts/answer/185833) (or any SMTP provider)
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

   Create a `.env` file in the project root (see [Environment Variables](#environment-variables) below):

   ```bash
   cp .env.example .env   # if an example file exists, otherwise create it manually
   ```

4. **Seed the database** *(optional — creates sample data)*

   ```bash
   npm run seed
   ```

5. **Start the development server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Environment Variables

Create a `.env` file at the root of the project (copy `.env.example`), with the following required variables:

```env
IMAGEKIT_PRIVATE_KEY=
IMAGEKIT_PUBLIC_KEY=
IMAGEKIT_URL_ENDPOINT=
MONGODB_URI=
NEXT_PUBLIC_URL=https://callu.up.railway.app
OTP_BCC_EMAIL=
PORT=
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM_NAME=CALLU
```

> **Note:** You can replace `NEXT_PUBLIC_URL` with your local URL (for example `http://localhost:3000`) for local development.  
> **Note:** ImageKit variables are optional. If omitted, room chat file attachments and automatic cleanup of expired uploads are disabled.

---

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the development server with hot-reload (via nodemon + ts-node) |
| `npm run build` | Build the Next.js app and compile the custom server for production |
| `npm start` | Run the production server (requires `npm run build` first) |
| `npm run lint` | Lint the codebase with ESLint |
| `npm run seed` | Seed the MongoDB database with initial data |

---

## Project Structure

```
callu/
├── app/                  # Next.js App Router pages and API routes
│   ├── admin/            # Admin dashboard
│   ├── api/              # REST API routes (auth, apply, calls, rooms, …)
│   ├── dashboard/        # Member dashboard (members, calls, rooms, settings, wallet)
│   └── page.tsx          # Landing page
├── components/           # Shared React components
├── context/              # React context providers (auth, …)
├── lib/                  # Server-side utilities (DB, email, config validation)
├── models/               # Mongoose models (User, Room, CallLog, …)
├── public/               # Static assets
├── server.ts             # Custom Node.js + Socket.IO server entry point
├── seed.ts               # Database seeding script
├── render.yaml           # Render deployment configuration
└── next.config.ts        # Next.js configuration
```

---

## Deployment

The project ships with a `render.yaml` for one-click deployment on [Render](https://render.com).

1. Push your code to GitHub.
2. Create a new **Web Service** on Render and connect your repository.
3. Render will automatically detect `render.yaml` and use the configured build (`npm install && npm run build`) and start (`npm start`) commands.
4. Add all required [Environment Variables](#environment-variables) in the Render dashboard under **Environment**.

---

## Contributing

Contributions are welcome! For **large features**, please start a discussion first to gather feedback from maintainers and clarify scope before proceeding. For smaller fixes, open an issue or pull request directly. Make sure `npm run lint` passes before submitting.

Pull requests should follow the template in `.github/pull_request_template.md`, include a `Fixes #<issue-number>` reference, and use a conventional PR title such as `fix: short summary`.

# Content Planner

A Notion-style content planning tool for scheduling and reviewing social media posts. Built with Next.js and Supabase.

**Live:** [https://tshermee.github.io/content-planner](https://tshermee.github.io/content-planner)

## Features

- **Calendar view** — monthly grid showing scheduled posts with status indicators
- **Notion-like editor** — block-based rich text editor with slash commands (powered by BlockNote)
- **Inline text comments** — select any text in a post to leave a comment, highlighted ranges with resolve flow
- **Simple approvals** — each user approves or rejects; post status updates automatically
- **4 channel tags** — Chrigu Linkedin, Marco Linkedin, BossInfo Linkedin, Interner Post
- **Realtime updates** — changes sync instantly via Supabase Realtime
- **Dark mode** — Notion-inspired dark theme

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16, React, TypeScript |
| Styling | Tailwind CSS, shadcn/ui |
| Editor | BlockNote |
| Backend | Supabase (PostgreSQL + Realtime) |
| Hosting | GitHub Pages (frontend), Supabase (backend) |

## Local Development

```bash
git clone https://github.com/Tshermee/content-planner.git
cd content-planner
npm install
```

Create `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deployment

The frontend auto-deploys to GitHub Pages on every push to `master` via GitHub Actions.

### Required GitHub Secrets

Set these in **Settings > Secrets and variables > Actions**:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Enable GitHub Pages

Go to **Settings > Pages > Source** and select **GitHub Actions**.

## Database Schema

Three tables in Supabase:

- **posts** — title, markdown content, tag, scheduled_at, status (draft/approved/rejected)
- **approvals** — per-user yes/no vote on each post (unique per post + user)
- **comments** — inline text comments with character offsets for highlighting

# 🌿 Wedding Planner

A full-stack wedding planning app. Runs entirely on **GitHub + Railway** — no third-party database accounts needed. Railway provides Postgres automatically.

---

## 🚀 Deploy in 5 minutes

### Step 1 — Push to GitHub
```bash
# In the unzipped folder:
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/wedding-planner.git
git push -u origin main
```

### Step 2 — Create Railway project
1. Go to [railway.app](https://railway.app) → **New Project**
2. Choose **Deploy from GitHub repo** → select your repo
3. Railway detects Next.js and starts building

### Step 3 — Add a Postgres database
1. In your Railway project, click **+ New** → **Database** → **Add PostgreSQL**
2. Railway automatically creates a `DATABASE_URL` variable and injects it into your app
3. That's it — no configuration needed

### Step 4 — Set environment variables
In Railway → your app service → **Variables**, add:
```
NEXT_PUBLIC_APP_URL = https://your-app.up.railway.app
```
(Optional) For guest confirmation emails via [Resend](https://resend.com):
```
RESEND_API_KEY = re_xxxxxxxxxxxx
```

### Step 5 — Done!
Railway redeploys automatically. On startup, it runs `prisma migrate deploy` to set up all database tables. Visit your Railway URL and start planning.

---

## 💻 Local development

```bash
# 1. Install dependencies
npm install

# 2. Set up environment
cp .env.example .env.local
# Edit .env.local — add a local Postgres connection string
# e.g. postgresql://postgres:password@localhost:5432/wedding

# 3. Set up database
npx prisma migrate dev --name init

# 4. Run
npm run dev
```
Open [http://localhost:3000](http://localhost:3000)

---

## ✨ What's included

| Tab | Features |
|---|---|
| **Dashboard** | RSVP stats, progress bar, selected venue banner |
| **Venues** | Add via URL (auto-scrapes name/image/address), enter cost manually, drag-to-compare, select as your venue |
| **Guest list** | Add guests, assign plus-ones, filter by RSVP status, export CSV |
| **RSVP portal** | QR code → `/rsvp`, fuzzy name match, dietary, email capture, confirmation email |
| **Seating chart** | Add tables (round/rect/oval), drag-and-drop floor plan, assign guests |
| **Budget** | Inline-editable categories, allocation bar, budgeted vs paid vs remaining |
| **Vendors** | Category, contact, status (researching → paid) |
| **Tasks** | Priority, due date, assigned to, progress |
| **Checklists** | Pre-built 12-month wedding checklist |
| **Timeline** | Click-to-edit day-of schedule, printable |
| **Menu & drinks** | Menu courses + drink calculator by guest count |
| **Wedding party** | Bride's & groom's sides, roles, attire, contact |
| **Décor** | Area-based tracker with ordered status |
| **Attire** | Per-person fitting tracker |
| **Photoshoot** | Shot list by group, must-have flags |
| **Playlist** | Ceremony/cocktail/dinner/dancing/do-not-play sections |
| **Mood board** | Paste image URLs, masonry grid |
| **Gifts & thank yous** | Log gifts, mark thank-you notes sent |
| **Public `/rsvp`** | Beautiful mobile-first guest RSVP flow |
| **Public `/info`** | Wedding info page linked from confirmation emails |

---

## 🎯 Personalize

Update these files with your actual details before deploying:

| File | What to change |
|---|---|
| `src/components/layout/Sidebar.tsx` | Couple names, wedding date |
| `src/app/api/rsvp/route.ts` | Email `from` address, wedding details in email |
| `src/app/info/page.tsx` | Your story, timeline, venue, dress code |
| `src/app/rsvp/page.tsx` | Couple names + venue on RSVP page |
| `prisma/seed.ts` | Default bride/groom names, date |

---

## 📱 RSVP QR code

1. Go to **Dashboard → RSVP Portal**
2. Your RSVP URL is: `https://your-app.up.railway.app/rsvp`
3. Generate a QR code at [qr.io](https://qr.io) pointing to that URL
4. Print on invitations

Guest flow: Scan → enter name → system checks guest list → plus-one + dietary + email → confirmation email → auto-added to unassigned seating pool.

---

## 🗂 Stack

- **Next.js 15** — frontend + API routes
- **Prisma 5** — database ORM
- **PostgreSQL** — via Railway's built-in Postgres plugin
- **Resend** — optional transactional emails
- **Tailwind CSS** — styling
- **Zustand** — client state

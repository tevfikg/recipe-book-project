# RecipeVault

A web application for creating, managing, and sharing recipes with photos, structured ingredients, and step-by-step instructions.

## Tech Stack

- **Frontend:** React (Vite) + Tailwind CSS
- **Backend:** Node.js + Express
- **Database:** PostgreSQL via Supabase
- **Auth:** Supabase Auth (Google OAuth)
- **Storage:** Supabase Storage
- **PDF:** Puppeteer (server-side)
- **Payments:** Stripe

## Setup

### 1. Clone & install

```bash
# Install server dependencies
cd server && npm install

# Install client dependencies
cd ../client && npm install
```

### 2. Environment variables

```bash
cp .env.example .env
# Fill in your Supabase, Stripe, and App values
```

### 3. Database

Run `supabase/migrations/001_initial_schema.sql` in your Supabase SQL editor, then run `supabase/seed.sql` for initial tags.

### 4. Run

```bash
# Terminal 1 — Backend
cd server && npm run dev

# Terminal 2 — Frontend
cd client && npm run dev
```
##Here the link
https://recipevault-app.vercel.app/

#Can sign in with google account- o Auth

## User Roles

| Role | Recipes | Browse | Export | Bookmarks |
|---|---|---|---|---|
| Guest | ✗ | ✓ | ✓ | ✗ |
| Free | Up to 5 | ✓ | ✓ | ✓ |
| Premium | Unlimited | ✓ | ✓ | ✓ |

## Pricing

- **Free:** Up to 5 recipes
- **Premium:** $29/year — unlimited recipes

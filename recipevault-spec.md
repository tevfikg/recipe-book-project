# RecipeVault — Project Specification

> **Version:** 1.0  
> **Date:** 2026-02-26  
> **Purpose:** Full product specification for Antigravity to build and run the application.

---

## 1. Project Overview

**RecipeVault** is a web application that allows users to create, manage, and share their favorite recipes. Users can document recipes with photos, ingredient images, and structured steps, then export them as a beautifully formatted PDF or share them via a unique link. The platform targets home cooks and food enthusiasts who want to preserve and discover recipes in a clean, organized way.

---

## 2. Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React (Vite) |
| Styling | Tailwind CSS |
| Backend | Node.js + Express |
| Database | PostgreSQL (via Supabase) |
| Auth | Supabase Auth (Google OAuth) |
| File Storage | Supabase Storage (for photos) |
| PDF Generation | `react-pdf` / `puppeteer` (server-side) |
| Hosting | Vercel (frontend) + Railway or Render (backend) |
| Payments | Stripe (for premium subscriptions) |

---

## 3. User Roles

### 3.1 Guest (Unauthenticated)
- Can browse and view public recipes
- Can view a recipe's shareable link
- Cannot create, save, or export recipes
- Prompted to sign in to access full features

### 3.2 Free User (Authenticated)
- Signed in via Google OAuth
- Can create up to **5 recipes**
- Can browse and search all public recipes
- Can bookmark/save favorite recipes (unlimited)
- Can export any recipe as PDF or shareable link
- Sees a prompt to upgrade when approaching the recipe limit

### 3.3 Premium User (Paid — Annual Subscription)
- All Free User features
- **Unlimited recipe creation**
- Priority support
- Premium badge on profile

### 3.4 Admin
- Can manage users, flag/remove inappropriate content
- Access to a basic admin dashboard

---

## 4. Authentication

- **Method:** Google OAuth only (via Supabase Auth)
- On first login, a user profile is automatically created in the database
- Sessions are managed via JWT tokens (handled by Supabase)
- No email/password registration
- Users can log out from any page via the navbar

---

## 5. Core Features

### 5.1 Recipe Creation

Users can create a recipe using a structured form with the following fields:

| Field | Type | Required |
|---|---|---|
| Recipe Name | Text | Yes |
| Description | Textarea | Yes |
| Cover Photo | Image Upload | Yes |
| Tags / Categories | Multi-select | No |
| Cuisine Type | Text | No |
| Difficulty Level | Select (Easy / Medium / Hard) | No |
| Cooking Time | Number (minutes) | No |
| Base Servings | Number | Yes |
| Ingredients | Dynamic list (see 5.2) | Yes |
| Steps / Instructions | Dynamic list (see 5.3) | Yes |
| Visibility | Toggle (Public / Private) | Yes |

#### Free Tier Gate
- If the user already has 5 recipes, show an upgrade modal when they click "New Recipe"
- The modal explains the freemium limit and links to the pricing/upgrade page

### 5.2 Ingredients

Each ingredient entry contains:
- Name (text)
- Quantity (number)
- Unit (e.g., grams, cups, tbsp — dropdown)
- Optional photo upload (for the ingredient)

Users can add/remove ingredient rows dynamically. The ingredient list is tied to the serving size scaler (see 5.6).

### 5.3 Steps / Instructions

Each step entry contains:
- Step number (auto-incremented)
- Description (textarea)
- Optional photo upload for that step

Users can add/remove/reorder steps with drag-and-drop.

### 5.4 Recipe Browsing & Search

- **Homepage:** Features a hero section, recently added recipes, and popular/trending recipes
- **Browse Page:** Grid layout of all public recipes
- **Search:** Full-text search by recipe name, ingredient, or tag
- **Filters:** Filter by tag/category, difficulty level, cooking time range, cuisine
- **Recipe Card:** Shows cover photo, name, author avatar, cooking time, difficulty, and rating (if rated)

### 5.5 Recipe Detail Page

Each recipe has a dedicated detail page showing:
- Cover photo
- Recipe name, author, date created
- Tags, cuisine, difficulty, cooking time
- Serving size scaler (adjusts all ingredient quantities in real time)
- Full ingredient list (with optional ingredient photos)
- Step-by-step instructions (with optional step photos)
- Export buttons: **Download as PDF** and **Copy Shareable Link**
- Bookmark button (for logged-in users)

### 5.6 Serving Size Scaler

- Default serving size is set by the recipe author
- A numeric input (or +/- buttons) on the recipe detail page lets viewers adjust servings
- All ingredient quantities update dynamically in real time based on the ratio
- The scaler also applies to the PDF export (uses the currently selected serving size)

### 5.7 PDF Export

- A "Download PDF" button is available on every recipe detail page
- The generated PDF uses a clean recipe card layout including:
  - Recipe name and cover photo
  - Metadata (author, cooking time, difficulty, servings)
  - Tags
  - Ingredient list (scaled to current servings)
  - Numbered steps with optional photos
  - RecipeVault branding in the footer
- PDF is generated server-side and downloaded directly in the browser

### 5.8 Shareable Link

- Every public recipe has a unique, permanent URL: `recipevault.app/recipe/{slug}`
- A "Share" button copies the URL to the clipboard and shows a toast confirmation
- Shareable links work for non-logged-in users (read-only view)
- Private recipes have links that only work for the author when logged in

### 5.9 Bookmarks / Favorites

- Logged-in users can bookmark any public recipe by clicking a bookmark icon
- Bookmarks are accessible from the user's profile page under a "Saved" tab
- Bookmarks can be removed at any time

### 5.10 Tags & Categories

Predefined tags/categories include (but are not limited to):
- Vegan, Vegetarian, Gluten-Free, Dairy-Free
- Breakfast, Lunch, Dinner, Snack, Dessert
- Italian, Turkish, Asian, Mexican, Mediterranean, American
- Quick (under 30 min), Beginner-Friendly, Meal Prep

Users can select multiple tags per recipe. Tags are browsable/filterable on the Browse page.

---

## 6. User Profile

Each user has a profile page accessible at `/profile/{username}` with:
- Avatar (from Google account)
- Display name
- Short bio (optional, editable)
- Tabs: **My Recipes** | **Saved** | **Account Settings**
- Premium badge if subscribed
- Recipe count and join date

---

## 7. Monetization

### 7.1 Freemium Model
- **Free Tier:** Up to 5 created recipes. Browsing, saving, and exporting are unlimited.
- **Premium Tier:** Unlimited recipes. Billed annually.

### 7.2 Pricing
- Suggested price: **$29/year** (approx. $2.42/month)
- Payment processed via **Stripe Checkout**
- Annual subscription auto-renews; users can cancel anytime from Account Settings
- On cancellation, premium access remains until the end of the billing period
- After cancellation, if the user has more than 5 recipes, existing recipes remain viewable but they cannot create new ones until under the limit

### 7.3 Upgrade Flow
1. User hits the 5-recipe limit (or clicks "Upgrade" in the navbar/profile)
2. Modal or dedicated `/pricing` page shows the plan comparison
3. "Upgrade Now" button redirects to Stripe Checkout
4. On success, Stripe webhook updates the user's `is_premium` flag in the database
5. User is redirected back to the app with a success toast

---

## 8. Database Schema (PostgreSQL)

### `users`
| Column | Type | Notes |
|---|---|---|
| id | UUID (PK) | Supabase Auth user ID |
| email | VARCHAR | From Google OAuth |
| display_name | VARCHAR | From Google account |
| avatar_url | TEXT | From Google account |
| bio | TEXT | Optional |
| is_premium | BOOLEAN | Default: false |
| premium_until | TIMESTAMP | Null if not premium |
| stripe_customer_id | VARCHAR | For subscription management |
| created_at | TIMESTAMP | |

### `recipes`
| Column | Type | Notes |
|---|---|---|
| id | UUID (PK) | |
| user_id | UUID (FK → users) | |
| title | VARCHAR | |
| slug | VARCHAR (UNIQUE) | URL-friendly identifier |
| description | TEXT | |
| cover_photo_url | TEXT | |
| cuisine | VARCHAR | |
| difficulty | ENUM (easy, medium, hard) | |
| cooking_time_minutes | INTEGER | |
| base_servings | INTEGER | |
| is_public | BOOLEAN | Default: true |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

### `ingredients`
| Column | Type | Notes |
|---|---|---|
| id | UUID (PK) | |
| recipe_id | UUID (FK → recipes) | |
| name | VARCHAR | |
| quantity | DECIMAL | |
| unit | VARCHAR | |
| photo_url | TEXT | Optional |
| sort_order | INTEGER | |

### `steps`
| Column | Type | Notes |
|---|---|---|
| id | UUID (PK) | |
| recipe_id | UUID (FK → recipes) | |
| step_number | INTEGER | |
| description | TEXT | |
| photo_url | TEXT | Optional |

### `tags`
| Column | Type | Notes |
|---|---|---|
| id | UUID (PK) | |
| name | VARCHAR (UNIQUE) | |

### `recipe_tags`
| Column | Type | Notes |
|---|---|---|
| recipe_id | UUID (FK → recipes) | |
| tag_id | UUID (FK → tags) | |

### `bookmarks`
| Column | Type | Notes |
|---|---|---|
| user_id | UUID (FK → users) | |
| recipe_id | UUID (FK → recipes) | |
| created_at | TIMESTAMP | |

---

## 9. Pages & Routes

| Route | Page | Auth Required |
|---|---|---|
| `/` | Homepage (hero + featured recipes) | No |
| `/browse` | Browse & search all recipes | No |
| `/recipe/:slug` | Recipe detail page | No (read-only for guests) |
| `/recipe/new` | Create recipe form | Yes |
| `/recipe/:slug/edit` | Edit recipe form | Yes (owner only) |
| `/profile/:username` | User profile page | No (public recipes shown) |
| `/profile/me` | Own profile + saved recipes | Yes |
| `/pricing` | Pricing & upgrade page | No |
| `/login` | Redirect to Google OAuth | No |
| `/auth/callback` | OAuth callback handler | No |
| `/admin` | Admin dashboard | Admin only |

---

## 10. UI & Design

- **Design Style:** Clean, warm, and food-forward. Inspired by modern recipe blogs but more app-like.
- **Color Palette:** Warm whites and creams for backgrounds, burnt orange or terracotta as the primary accent, deep charcoal for text.
- **Typography:** `Playfair Display` for headings (elegant, food-brand feel), `Inter` for body text.
- **Responsive:** Mobile-first design. Works on mobile, tablet, and desktop.
- **Components to build:**
  - Navbar (logo, search bar, login/avatar, upgrade button if free)
  - Recipe Card (grid + list variants)
  - Recipe Form (multi-section with drag-and-drop steps)
  - Ingredient Row (inline edit with unit dropdown)
  - Serving Scaler (interactive number input)
  - Tag Selector (chip-style multi-select)
  - Export Modal (PDF download + share link copy)
  - Upgrade Modal (freemium limit gate)
  - Toast notifications

---

## 11. API Endpoints (REST)

### Auth
- `GET /auth/google` — Initiates Google OAuth
- `GET /auth/callback` — Handles OAuth callback

### Recipes
- `GET /api/recipes` — List public recipes (with search & filter params)
- `GET /api/recipes/:slug` — Get single recipe
- `POST /api/recipes` — Create recipe (auth required)
- `PUT /api/recipes/:id` — Update recipe (owner only)
- `DELETE /api/recipes/:id` — Delete recipe (owner only)
- `GET /api/recipes/:id/export/pdf` — Generate and return PDF

### Users
- `GET /api/users/:username` — Get user profile + public recipes
- `PUT /api/users/me` — Update own profile (bio, display name)

### Bookmarks
- `GET /api/bookmarks` — Get current user's bookmarks (auth required)
- `POST /api/bookmarks/:recipeId` — Add bookmark (auth required)
- `DELETE /api/bookmarks/:recipeId` — Remove bookmark (auth required)

### Tags
- `GET /api/tags` — List all available tags

### Payments
- `POST /api/stripe/create-checkout` — Create Stripe Checkout session
- `POST /api/stripe/webhook` — Receive Stripe events (subscription updates)
- `POST /api/stripe/cancel` — Cancel subscription (auth required)

---

## 12. Non-Functional Requirements

- **Performance:** Recipe pages should load in under 2 seconds on average
- **Image Optimization:** All uploaded images should be compressed and served via CDN (Supabase Storage handles this)
- **Security:**
  - All API routes that modify data require authentication
  - Users can only edit/delete their own recipes
  - File uploads validated for type (jpg, png, webp only) and size (max 5MB per file)
  - Stripe webhook signatures verified server-side
- **SEO:** Recipe detail pages rendered with proper Open Graph meta tags for link previews
- **Accessibility:** WCAG 2.1 AA compliance target; semantic HTML, keyboard navigation, alt text on all images

---

## 13. MVP Scope vs Future Enhancements

### MVP (Launch)
- Google login
- Recipe creation with photos, ingredients, steps
- Tags & categories
- Serving size scaler
- PDF export + shareable link
- Browse + search
- Bookmarks
- Freemium model with Stripe
- User profile page

### Post-MVP / V2
- Comments and ratings on recipes
- Recipe collections / folders
- "Tried it" photo uploads by other users
- Weekly meal planner
- Nutritional info (via API like Nutritionix)
- Mobile app (React Native)
- Social following (follow other users)

---

## 14. Environment Variables

```env
# Supabase
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRICE_ID=  # Annual plan price ID

# App
APP_URL=https://recipevault.app
NODE_ENV=production
```

---

## 15. Folder Structure (Suggested)

```
recipevault/
├── client/                  # React frontend (Vite)
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Route-level page components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── lib/             # Supabase client, utilities
│   │   └── App.jsx
│   └── index.html
├── server/                  # Node.js + Express backend
│   ├── routes/              # API route handlers
│   ├── middleware/          # Auth, validation
│   ├── services/            # PDF generation, Stripe logic
│   └── index.js
├── supabase/
│   └── migrations/          # SQL migration files
└── README.md
```

---

*End of Specification — RecipeVault v1.0*

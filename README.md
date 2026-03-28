# Tehop AI Sourcing App

An enterprise-grade mobile application for AI-powered product sourcing. Users describe or photograph a product, and an AI system finds the best purchasing options across the web — ranked by price, quality, and delivery speed.

## Features

- 📸 **Image + Text Input** — Describe a product in text or photograph it
- 🤖 **GPT-4o-mini Vision Analysis** — AI refines your query into precise e-commerce search terms
- 🌐 **Multi-Source Search** — Searches globally via Serper.dev Shopping API
- 💚 **Cheapest / ⭐ Best / ⚡ Fastest** — Three category rankings per search
- 🇪🇪🇪🇺🌍 **Region Filtering** — Estonia, Europe, or Global sourcing
- 🔒 **Security Verification** — Seller reputation and HTTPS checks
- 🔔 **Push Notifications** — Get notified when results are ready (up to 5 min)
- 💾 **Persistent History** — Recent searches saved locally via AsyncStorage

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Mobile App | React Native + Expo SDK 52 |
| Navigation | Expo Router v4 |
| Styling | NativeWind v4 (Tailwind CSS) |
| Language | TypeScript (strict) |
| Backend | Vercel Serverless Functions |
| AI | OpenAI GPT-4o-mini |
| Search | Serper.dev Shopping API |
| Database | Supabase (PostgreSQL) |
| Notifications | Expo Push Notifications |
| Storage | AsyncStorage |

## Project Structure

```
├── app/                    # Expo Router screens
│   ├── _layout.tsx         # Root layout with navigation stack
│   ├── index.tsx           # Home / Input screen
│   ├── processing.tsx      # "AI is thinking" animated screen
│   └── results.tsx         # Product results with filtering
├── components/
│   ├── ImagePickerComponent.tsx  # Camera/gallery image picker
│   ├── ProductCard.tsx           # Rich product display card
│   ├── FilterBar.tsx             # Category & region filter chips
│   └── LoadingOverlay.tsx        # Full-screen loading state
├── hooks/
│   ├── useProductSearch.ts       # Search state management
│   └── useNotifications.ts       # Push notification registration
├── services/
│   ├── api.ts                    # Axios API client
│   ├── notifications.ts          # Expo Notifications service
│   └── storage.ts                # AsyncStorage helpers
├── types/index.ts               # Shared TypeScript types
├── constants/colors.ts          # Design system colors
├── api/                         # Vercel serverless functions
│   ├── analyze.ts               # POST /api/analyze (AI query generation)
│   └── search.ts                # POST/GET /api/search (product search)
└── global.css                   # NativeWind / Tailwind CSS entry
```

## Getting Started

### Prerequisites

- Node.js 18+
- Expo CLI: `npm install -g expo-cli`
- An Expo account (for push notifications)

### Installation

```bash
git clone <repo-url>
cd LetsApp
npm install
cp .env.example .env
# Fill in your API keys in .env
expo start
```

### Environment Variables

Copy `.env.example` to `.env` and fill in:

| Variable | Description |
|----------|-------------|
| `OPENAI_API_KEY` | OpenAI API key (GPT-4o-mini access required) |
| `SERPER_API_KEY` | Serper.dev API key for shopping search |
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_ANON_KEY` | Supabase anonymous/public key |
| `SUPABASE_SERVICE_KEY` | Supabase service role key (backend only) |
| `EXPO_PUBLIC_API_URL` | Your Vercel deployment URL |

## Supabase Schema

Run this SQL in your Supabase project:

```sql
-- Search requests table
create table search_requests (
  id uuid primary key,
  text_input text,
  has_image boolean default false,
  filters jsonb,
  expo_push_token text,
  status text default 'processing',
  ai_query text,
  created_at timestamptz default now(),
  completed_at timestamptz
);

-- Search results table
create table search_results (
  id uuid primary key default gen_random_uuid(),
  request_id uuid references search_requests(id),
  title text,
  description text,
  price numeric,
  currency text,
  total_cost numeric,
  shipping_cost numeric,
  estimated_delivery_days int,
  rating numeric,
  review_count int,
  image_url text,
  purchase_url text,
  seller text,
  seller_reputation text,
  origin text,
  is_secure boolean,
  brand text,
  category text,
  created_at timestamptz default now()
);

-- Indexes
create index on search_requests(status);
create index on search_results(request_id);
create index on search_results(category);
```

## Deploying the Backend

```bash
npm install -g vercel
vercel --prod
```

Set the environment variables in the Vercel dashboard or via `vercel env add`.

## App Flow

```
Home Screen
  │  User enters text + optional image
  │  Selects region filters
  ↓
POST /api/analyze
  │  AI generates optimized search query
  │  Stores request in Supabase
  ↓
Processing Screen
  │  Animated steps UI
  │  Polls GET /api/analyze every 8s
  ↓
POST /api/search (background)
  │  Fetches products via Serper.dev
  │  Categorizes: cheapest / best / fastest
  │  Saves to Supabase
  │  Sends push notification
  ↓
Results Screen
  │  Displays ProductCards
  │  Filter by category & region
  │  Open deals in browser
```

## Design System

The app uses a dark navy theme:

| Token | Value | Usage |
|-------|-------|-------|
| Background | `#0F172A` | Screen backgrounds |
| Surface | `#1E293B` | Cards, inputs |
| Primary | `#6366F1` | Buttons, active states |
| Cheapest | `#10B981` | Green price category |
| Best | `#6366F1` | Purple quality category |
| Fastest | `#F59E0B` | Amber speed category |

## License

MIT
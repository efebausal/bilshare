# BilShare – Bilkent University Ride Share

A ride-sharing platform exclusively for Bilkent University students. Only verified `@bilkent.edu.tr` emails can access the app.

## Tech Stack

- **Next.js 15** (App Router, TypeScript, Server Actions)
- **Clerk** – Authentication & user management
- **Prisma** – ORM
- **Neon Postgres** – Database
- **Tailwind CSS** – Styling
- **Zod** – Validation

## Getting Started

### 1. Clone & Install

```bash
npm install --legacy-peer-deps
```

### 2. Configure Environment

Copy `.env.example` to `.env` and fill in:

```bash
cp .env.example .env
```

**Required variables:**

| Variable | Source |
|---|---|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | [Clerk Dashboard](https://dashboard.clerk.com) |
| `CLERK_SECRET_KEY` | Clerk Dashboard |
| `CLERK_WEBHOOK_SECRET` | Clerk Dashboard → Webhooks |
| `DATABASE_URL` | [Neon Console](https://console.neon.tech) (pooled connection) |
| `DIRECT_DATABASE_URL` | Neon Console (direct connection) |

### 3. Clerk Configuration

1. Create a Clerk application at [clerk.com](https://clerk.com)
2. **Restrict email domains**: In Clerk Dashboard → Settings → Restrictions, add `bilkent.edu.tr` to the allowlist
3. Set up a webhook endpoint pointing to `https://your-domain.com/api/webhooks/clerk` with events: `user.created`, `user.updated`, `user.deleted`

### 4. Database Setup

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# (Optional) Seed sample data
npm run db:seed
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
src/
├── actions/          # Server actions (rides, profile, reports)
├── app/
│   ├── api/webhooks/ # Clerk webhook handler
│   ├── dashboard/    # My rides dashboard
│   ├── profile/      # User profile
│   ├── rides/
│   │   ├── new/      # Create ride
│   │   └── [id]/     # Ride details
│   ├── sign-in/      # Clerk sign-in
│   └── sign-up/      # Clerk sign-up
├── components/
│   ├── ui/           # Reusable UI components
│   ├── bilkent-gate  # Domain enforcement gate
│   ├── navbar        # Navigation
│   ├── ride-card     # Ride card component
│   └── ride-filters  # Filter controls
├── lib/
│   ├── auth.ts       # Bilkent auth utilities (assertBilkentUser, etc.)
│   ├── constants.ts  # Frequent locations, pagination
│   ├── db.ts         # Prisma client singleton
│   ├── utils.ts      # Formatting helpers
│   └── validations.ts # Zod schemas
└── middleware.ts     # Clerk route protection
```

## Security

- **Domain enforcement**: Server-side `assertBilkentUser()` on every mutation; Clerk middleware protects all routes
- **Bilkent Gate**: Server component blocks UI for non-Bilkent emails
- **Webhook verification**: Svix signature validation for Clerk webhooks
- **Seat overbooking prevention**: Prisma transactions with availability checks
- **Input validation**: Zod schemas on all server actions
- **Authorization**: Driver-only actions (cancel ride, accept/reject), participant-only messaging

## Deployment (Vercel)

1. Push to GitHub
2. Import in [Vercel](https://vercel.com)
3. Add all env vars from `.env.example`
4. Deploy — Prisma client generates via `postinstall`

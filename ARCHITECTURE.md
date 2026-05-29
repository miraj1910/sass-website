# PulseDesk Application Architecture

## Overview
This document describes the architecture of the PulseDesk SaaS platform built with Next.js 16 App Router, TypeScript, Tailwind CSS, Supabase, and NextAuth.

## Folder Structure
```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/             # Authentication routes (layout protects these)
│   │   ├── layout.tsx      # Auth layout (centered, dark background)
│   │   ├── login/          # Login page
│   │   │   └── page.tsx    # Google Sign-in with form
│   │   └── signup/         # Signup page
│   │       └── page.tsx    # Google Sign-up with form
│   ├── (protected)/        # Protected routes (requires authentication)
│   │   ├── layout.tsx      # Protected layout with Navbar and Sidebar
│   │   ├── dashboard/      # Main dashboard
│   │   │   └── page.tsx    # Dashboard overview with metric cards
│   │   ├── settings/       # User settings
│   │   │   └── page.tsx    # Profile and account settings
│   │   └── page.tsx        # Redirect to dashboard
│   ├── api/                # API routes
│   │   ├── auth/           # NextAuth authentication endpoints
│   │   │   └── [...nextauth]/route.ts
│   │   └── stripe/         # Stripe integration (checkout, portal, webhook)
│   │       ├── checkout/route.ts
│   │       ├── portal/route.ts
│   │       └── webhook/route.ts
│   ├── layout.tsx          # Root layout (includes global CSS and metadata)
│   ├── page.tsx            # Homepage (marketing site)
│   ├── favicon.ico
│   └── globals.css         # Global styles (Tailwind base)
├── components/             # Reusable UI components
│   ├── DashboardCard.tsx   # Metric card for dashboard
│   ├── Navbar.tsx          # Responsive navigation bar
│   ├── Sidebar.tsx         # Collapsible sidebar (mobile-friendly)
│   ├── sonner-toaster.tsx  # Toast notification container
│   └── auth/               # Authentication form components
│       ├── SignInForm.tsx
│       └── SignUpForm.tsx
├── lib/                    # Utility functions and service clients
│   ├── auth.ts             # NextAuth configuration with Supabase adapter
│   ├── stripe.ts           # Stripe client setup
│   └── supabase.ts         # Supabase client setup
├── types/                  # TypeScript type definitions
│   └── next-auth.d.ts      # NextAuth type augmentation
├── prisma/                 # Prisma ORM (database models and migrations)
│   ├── schema.prisma       # Database schema
│   └── seed.ts             # Demo data generation
└── public/                 # Static assets
```

## Key Features

### Authentication
- Google OAuth only (no email/password)
- NextAuth.js with Supabase adapter for session management
- Automatic user creation on first sign-in
- Protected routes middleware (via layout)
- Session handling with JWT

### Database (Supabase/PostgreSQL)
- User model (profile info, role, workspace association)
- Workspace model (company workspace with analytics and subscription)
- Subscription model (Stripe-connected subscription plans)
- Analytics model (monthly metrics: followers, engagement, revenue, etc.)
- ActivityLog model (user action tracking)

### Stripe Billing
- Three plans: Free (₹0), Pro (₹999), Business (₹2999)/month
- Checkout Secure payment processing for upgrades/downgrades
- Customer Portal Self-service billing management
- Webhooks Real-time subscription status updates
- Current plan displayed in user dashboard

### UI/UX
- Modern dark theme with Tailwind CSS
- Responsive design (mobile, tablet, desktop)
- Collapsible sidebar on mobile
- Loading and error states
- Toast notifications (via Sonner)
- Lucide icons for consistent visual language

### Architecture Decisions
1. **App Router**: Used for all routes with route groups for layout organization
2. **Authentication Layout**: Separate layout for auth pages (centered form)
3. **Protected Layout**: Includes Navbar and Sidebar for authenticated users
4. **Modular Components**: Reusable DashboardCard, Navbar, Sidebar
5. **Service Layer**: Supabase and Stripe clients in lib/ for easy access
6. **Type Safety**: End-to-end TypeScript with Prisma-generated types

## Setup Instructions

### Prerequisites
- Node.js 18+ 
- PostgreSQL database (Supabase)
- Stripe account
- Google OAuth credentials

### Environment Setup
1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```
2. Edit `.env` with your actual values:
   ```env
   # NextAuth
   NEXTAUTH_SECRET=your-nextauth-secret-here
   NEXTAUTH_URL=http://localhost:3000

   # Google OAuth
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret

   # Database (Supabase)
   DATABASE_URL="postgresql://postgres:password@host:port/db"

   # Supabase (for NextAuth adapter)
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

   # Stripe
   STRIPE_SECRET_KEY=your-stripe-secret-key
   STRIPE_WEBHOOK_SECRET=your-stripe-webhook-secret
   STRIPE_PRICE_ID_PRO=your-stripe-price-id-pro
   STRIPE_PRICE_ID_BUSINESS=your-stripe-price-id-business
   ```

### Database Setup
```bash
# Install dependencies
npm install

# Run Prisma migrations
npx prisma migrate dev

# Seed the database with demo data
npx prisma db seed
```

### Development Server
```bash
npm run dev
```
Visit [http://localhost:3000](http://localhost:3000) to see the application.

### Production Build
```bash
npm run build
npm start
```

## Notes
- This implementation removes all credentials-based authentication as requested
- Only Google OAuth is used for authentication
- Passwords are not stored or handled in the application
- All sensitive data should be kept in environment variables
- Stripe webhook endpoint should be set to `/api/stripe/webhook`
- Enable these events in Stripe webhook settings:
  - `checkout.session.completed`
  - `invoice.payment_succeeded`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`

## Folder Descriptions

### `src/app/`
- Route groups `(auth)` and `(protected)` organize layouts
- `api/` contains endpoint routes for auth and Stripe
- Root `layout.tsx` provides global styles and metadata

### `src/components/`
- Reusable UI components used across pages
- `DashboardCard.tsx` for metric displays
- `Navbar.tsx` and `Sidebar.tsx` for navigation
- `auth/` contains form components for login/signup

### `src/lib/`
- Service initialize and configuration
- `supabase.ts`: Supabase client
- `stripe.ts`: Stripe client
- `auth.ts`: NextAuth configuration

### `src/types/`
- TypeScript declarations and augmentations

### `prisma/`
- Database schema and seed data
- `schema.prisma`: Defines all database models
- `seed.ts`: Generates realistic demo data
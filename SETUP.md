# PulseDesk Setup Guide

## Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (version 18 or higher)
- [npm](https://www.npmjs.com/) (comes with Node.js)
- A [Supabase](https://supabase.io/) account and project
- A [Stripe](https://stripe.com/) account
- Google Cloud credentials for OAuth

## Environment Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd pulsedesk
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Copy the example environment file and fill in your values:

```bash
cp .env.example .env
```

Then edit `.env` with your actual values:

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

#### Getting Your Credentials

**Supabase:**
1. Create a project at [supabase.io](https://supabase.io/)
2. Get your URL and anon key from Settings > API

**Google OAuth:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a project or select existing
3. Navigate to APIs & Services > Credentials
4. Create OAuth 2.0 Client ID
5. Set authorized redirect URI to: `http://localhost:3000/api/auth/callback/google`
6. Copy the Client ID and Client Secret

**Stripe:**
1. Create a Stripe account at [stripe.com](https://stripe.com)
2. Get your secret key from Developers > API keys
3. Create products and prices for your Pro and Business plans
4. Copy the price IDs to your .env file

### 4. Database Setup

Run Prisma migrations to set up the database schema:

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Seed the database with demo data
npx prisma db seed
```

### 5. Stripe Webhook Configuration

Before running the application:

1. Create a Stripe account at [stripe.com](https://stripe.com)
2. Get your secret key from Developers > API keys
3. Configure a webhook endpoint pointing to `/api/stripe/webhook`
4. Enable these events in webhook settings:
   - `checkout.session.completed`
   - `invoice.payment_succeeded`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Create price objects for your Pro and Business plans

### 6. Development Server

Start the development server:

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

### 7. Production Build

To build for production:

```bash
npm run build
```

To start the production server:

```bash
npm start
```

## Project Structure Overview

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/             # Authentication routes
│   ├── (protected)/        # Protected routes
│   ├── api/                # API routes (auth, stripe webhooks)
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Homepage
├── components/             # Reusable UI components
├── lib/                    # Service clients (supabase, stripe, auth)
├── types/                  # TypeScript definitions
├── prisma/                 # Database schema and seed
└── public/                 # Static assets
```

## Troubleshooting

### Common Issues

1. **Authentication Errors**
   - Verify Google OAuth redirect URI is set correctly
   - Check that GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are correct
   - Ensure NEXTAUTH_SECRET is set (32+ character random string)

2. **Database Connection Errors**
   - Verify DATABASE_URL points to your Supabase project
   - Check that your Supabase project is active
   - Ensure IP whitelisting allows your connection (if enabled)

3. **Stripe Webhook Errors**
   - Verify webhook endpoint is correctly configured in Stripe dashboard
   - Check that STRIPE_WEBHOOK_SECRET matches your webhook secret
   - Ensure your local server is accessible (use ngrok for local testing)

4. **Prisma Generate Issues**
   - Run `npx prisma generate` after any schema changes
   - Delete node_modules and reinstall if experiencing issues

## Next Steps

After setting up the application:

1. Explore the dashboard at `/dashboard`
2. Check user settings at `/settings`
3. Test the authentication flow
4. Monitor Stripe webhooks in your dashboard
5. Customize the UI components in `src/components/`

## License

MIT License - feel free to use this code as a starting point for your own SaaS applications.
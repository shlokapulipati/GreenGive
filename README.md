# GreenGive

GreenGive is a modern golf charity platform that connects the joy of golf with giving back. 
Players can enter their stableford scores, compete on the leaderboard, win monthly cash prizes, and support their favorite charities with every subscription.

## Features

- **Score Management & Leaderboards**: Add Stableford scores; only your 5 latest scores are kept to maintain fair 
competitiveness. 
- **Subscriptions & Giving**: Integrated with Stripe for monthly/yearly memberships. A proportion of every 
subscription automatically goes to the player's charity of choice.
- **Winnings Interface**: Real-time prize pool display, draw countdowns, and a secure dashboard for winners to upload proof of scores.
- **Robust Authentication**: Powered by Supabase for high-security login and registration.

## Tech Stack

### Frontend
- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS & Vanilla CSS for animations
- **Icons & Animations**: Lucide React, Framer Motion

### Backend
- **Server**: Node.js & Express
- **Database**: PostgreSQL (via Supabase)
- **Authentication**: Supabase Auth (SSR proxy)
- **Payments**: Stripe Checkout & Webhooks

## Setup Instructions

1. **Environment Variables**
Ensure `.env` files are updated with the corresponding keys. You need `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `STRIPE_SECRET_KEY`, and `SUPABASE_SERVICE_ROLE_KEY`.

2. **Frontend**
cd greengive
npm install
npm run dev

3. **Backend**
cd backend
npm install
npm run dev

## License

All rights reserved. (c) GreenGive 2026.

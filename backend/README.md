// GreenGive Backend — Created: ${new Date().toISOString()}
// This is the API server for GreenGive, running on port 4000.
// To start: npm run dev

/**
 * GreenGive Backend Structure
 *
 * src/
 * ├── index.ts              — Express app entry point
 * ├── config/
 * │   ├── supabase.ts       — Supabase Admin client (Service Role)
 * │   └── stripe.ts         — Stripe SDK initialization
 * ├── engine/
 * │   └── draw-engine.ts    — Draw simulation math engine
 * └── routes/
 *     ├── stripe.ts         — POST /api/stripe/checkout, /portal
 *     ├── webhook.ts        — POST /api/webhook/stripe
 *     ├── draws.ts          — POST /api/draws/simulate, /publish
 *     └── scores.ts         — GET/POST/DELETE /api/scores
 *
 * Environment Variables Required:
 *   SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *   STRIPE_SECRET_KEY
 *   STRIPE_WEBHOOK_SECRET
 *   FRONTEND_URL
 *   PORT (default: 4000)
 */

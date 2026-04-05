
let _stripe: any = null;

if (process.env.STRIPE_SECRET_KEY) {
  
  const { default: Stripe } = await import('stripe');
  _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-02-24.acacia',
    appInfo: { name: 'GreenGive Backend', version: '1.0.0' },
  });
} else {
  console.warn('⚠️  STRIPE_SECRET_KEY not set — Stripe features disabled until you add it to .env');
}


export const stripe: any = _stripe;

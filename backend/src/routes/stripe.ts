import { Router } from 'express';
import type { Request, Response } from 'express';
import { stripe } from '../config/stripe.js';
import { supabaseAdmin } from '../config/supabase.js';

const router = Router();

const requireStripe = (_req: Request, res: Response, next: any) => {
  if (!stripe) return res.status(503).json({ error: 'Stripe not configured. Set STRIPE_SECRET_KEY in .env' });
  next();
};

router.post('/checkout', async (req: Request, res: Response) => {
  try {
    const { priceId, userId, email } = req.body;
    if (!priceId || !userId) return res.status(400).json({ error: 'Missing parameters' });

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', userId)
      .single();

    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

    const session = await stripe.checkout.sessions.create({
      customer: profile?.stripe_customer_id || undefined,
      client_reference_id: userId,
      customer_email: profile?.stripe_customer_id ? undefined : email,
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${baseUrl}/dashboard?success=true`,
      cancel_url: `${baseUrl}/dashboard?canceled=true`,
    });

    res.json({ url: session.url });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/portal', async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', userId)
      .single();

    if (!profile?.stripe_customer_id) {
      return res.status(400).json({ error: 'No subscription found' });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard`,
    });

    res.json({ url: session.url });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

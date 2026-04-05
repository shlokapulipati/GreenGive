import { Router } from 'express';
import express from 'express';
import type { Request, Response } from 'express';
import { stripe } from '../config/stripe.js';
import { supabaseAdmin } from '../config/supabase.js';

const router = Router();


router.post('/', express.raw({ type: 'application/json' }), async (req: Request, res: Response) => {
  const signature = req.headers['stripe-signature'] as string;
  let event: any;

  if (!stripe) {
    console.error('Stripe not configured, skipping webhook');
    return res.status(503).send('Stripe not configured');
  }

  try {
    event = stripe.webhooks.constructEvent(req.body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        if (session.mode === 'subscription' && session.client_reference_id) {
          const userId = session.client_reference_id;
          const subId = (session.subscription as string) || (session.id as string);
          const customerId = session.customer as string;

          
          let renewalDate = null;
          let planType = 'monthly';

          if (session.subscription) {
            const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
            const priceId = subscription.items.data[0].price.id;
            planType = priceId.includes('year') ? 'yearly' : 'monthly';
            renewalDate = new Date(subscription.current_period_end * 1000).toISOString();
          }

          
          await supabaseAdmin.from('profiles').update({
            subscription_status: 'active',
            subscription_plan: planType,
            stripe_customer_id: customerId,
            stripe_sub_id: subId,
            renewal_date: renewalDate,
          }).eq('id', userId);

          
          await supabaseAdmin.from('subscription_logs').insert({
            user_id: userId,
            plan: planType,
            stripe_sub_id: subId,
            stripe_customer_id: customerId,
            status: 'active',
            amount: session.amount_total ? session.amount_total / 100 : 9.99,
            event_type: event.type,
          });
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        const subId = subscription.id;
        const status = (subscription.status === 'active' || subscription.status === 'trialing') ? 'active' : 'lapsed';
        const renewalDate = new Date(subscription.current_period_end * 1000).toISOString();

        const { data: profile } = await supabaseAdmin
          .from('profiles')
          .select('id, subscription_plan')
          .eq('stripe_sub_id', subId)
          .single();

        if (profile) {
          await supabaseAdmin.from('profiles').update({
            subscription_status: status,
            renewal_date: renewalDate,
          }).eq('id', profile.id);

          await supabaseAdmin.from('subscription_logs').insert({
            user_id: profile.id,
            plan: profile.subscription_plan || 'monthly',
            stripe_sub_id: subId,
            stripe_customer_id: subscription.customer as string,
            status,
            event_type: event.type,
          });
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const { data: profile } = await supabaseAdmin
          .from('profiles')
          .select('id, subscription_plan')
          .eq('stripe_sub_id', subscription.id)
          .single();

        if (profile) {
          await supabaseAdmin.from('profiles').update({
            subscription_status: 'cancelled',
            renewal_date: null,
          }).eq('id', profile.id);

          await supabaseAdmin.from('subscription_logs').insert({
            user_id: profile.id,
            plan: profile.subscription_plan || 'monthly',
            stripe_sub_id: subscription.id,
            stripe_customer_id: subscription.customer as string,
            status: 'cancelled',
            event_type: event.type,
          });
        }
        break;
      }
    }

    res.json({ received: true });
  } catch (error: any) {
    console.error(`Webhook execution failed: ${error.message}`);
    res.status(500).send(`Server Error: ${error.message}`);
  }
});

export default router;

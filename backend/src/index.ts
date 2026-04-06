import 'dotenv/config'; 
import express from 'express';
import cors from 'cors';

import webhookRouter from './routes/webhook.js';
import stripeRouter from './routes/stripe.js';
import drawsRouter from './routes/draws.js';
import scoresRouter from './routes/scores.js';


const app = express();
const PORT = process.env.PORT || 4000;


const allowedOrigins: string[] = [
  process.env.FRONTEND_URL,
  'https://green-give-one.vercel.app',
  'http://localhost:3000',
].filter((o): o is string => typeof o === 'string');

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));


app.use('/api/webhook/stripe', webhookRouter);


app.use(express.json());


app.use('/api/stripe', stripeRouter);
app.use('/api/draws', drawsRouter);
app.use('/api/scores', scoresRouter);


app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'GreenGive Backend',
    timestamp: new Date().toISOString(),
    config: {
      supabase: !!process.env.SUPABASE_URL,
      stripe: !!process.env.STRIPE_SECRET_KEY,
    }
  });
});


app.listen(PORT, () => {
  console.log(`\n🟢 GreenGive Backend running on http://localhost:${PORT}`);
  if (!process.env.SUPABASE_URL) console.warn('  ⚠️  SUPABASE_URL not set');
  if (!process.env.STRIPE_SECRET_KEY) console.warn('  ⚠️  STRIPE_SECRET_KEY not set');
  console.log(`   Health: http://localhost:${PORT}/health\n`);
});

export default app;

import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '../config/supabase.js';
import { simulateDraw, DrawLogic, calculatePrizePool, distributePrizes } from '../engine/draw-engine.js';

const router = Router();

interface AuthRequest extends Request {
  user?: any;
}

const verifyAdmin = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !user) return res.status(401).json({ error: 'Unauthorized' });

  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });

  req.user = user;
  next();
};

router.post('/simulate', verifyAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { logic } = req.body;

    const { data: activeSubscribers, error: subError } = await supabaseAdmin
      .from('profiles')
      .select('id, scores(score)')
      .eq('subscription_status', 'active');

    if (subError || !activeSubscribers) throw new Error('Failed to fetch subscribers');

    const allScoresList: number[] = [];
    const userScoresMap = activeSubscribers.map((sub: any) => {
      const uScores = (sub.scores || []).map((s: any) => s.score).slice(0, 5);
      allScoresList.push(...uScores);
      return { user_id: sub.id, scores: uScores };
    });

    const simulation = simulateDraw(logic as DrawLogic, userScoresMap, allScoresList);
    const pool = calculatePrizePool(activeSubscribers.length, 0);
    const distributions = distributePrizes(pool, simulation.winners);

    res.json({ simulation, distributions, pool });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/publish', verifyAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { month, logic, drawNumbers, winners, poolTotals } = req.body;

    const { data: draw, error: drawError } = await supabaseAdmin
      .from('draws')
      .insert({
        month,
        numbers: drawNumbers,
        logic_type: logic,
        status: 'published',
        jackpot_amount: poolTotals.jackpot,
        total_pool: poolTotals.total,
        published_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (drawError || !draw) throw new Error('Failed to create draw');

    const { tiers } = distributePrizes(poolTotals, winners);
    
    const winnerInserts: any[] = [];
    [3, 4, 5].forEach(tier => {
      const tierData = (tiers as any)[tier];
      if (tierData && tierData.winners.length > 0) {
        tierData.winners.forEach((w: any) => {
          winnerInserts.push({
            user_id: w.user_id,
            draw_id: draw.id,
            tier: tier,
            amount: tierData.perWinner,
            status: 'pending',
          });
        });
      }
    });

    if (winnerInserts.length > 0) {
      await supabaseAdmin.from('winners').insert(winnerInserts);
    }

    res.json({ success: true, drawId: draw.id });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

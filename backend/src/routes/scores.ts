import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '../config/supabase.js';

const router = Router();

interface AuthRequest extends Request {
  user?: any;
}

const verifyUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !user) return res.status(401).json({ error: 'Unauthorized' });

  
  
  await supabaseAdmin.from('profiles').upsert({
    id: user.id,
    email: user.email,
    full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Golfer'
  }, { 
    onConflict: 'id',
    ignoreDuplicates: true 
  });

  req.user = user;
  next();
};



router.post('/', verifyUser, async (req: AuthRequest, res: Response) => {
  try {
    const { score, played_at } = req.body;

    if (!score || score < 1 || score > 45) {
      return res.status(400).json({ error: 'Score must be between 1 and 45' });
    }

    const { data, error } = await supabaseAdmin
      .from('scores')
      .insert({ user_id: req.user.id, score, played_at })
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});


router.get('/', verifyUser, async (req: AuthRequest, res: Response) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('scores')
      .select('*')
      .eq('user_id', req.user.id)
      .order('played_at', { ascending: false });

    if (error) throw error;
    res.json({ data });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});


router.delete('/:id', verifyUser, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const { error } = await supabaseAdmin
      .from('scores')
      .delete()
      .eq('id', id)
      .eq('user_id', req.user.id);

    if (error) throw error;
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '../config/supabase.js';

const router = Router();

interface AuthRequest extends Request {
  user?: any;
}


const verifyAdmin = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !user) return res.status(401).json({ error: 'Unauthorized' });

  const { data: profile } = await supabaseAdmin.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });

  req.user = user;
  next();
};




router.get('/users', verifyAdmin, async (_req, res) => {
  try {
    const { data: users, error } = await supabaseAdmin
      .from('profiles')
      .select('*, scores(count)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ data: users });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});


router.get('/users/:id', verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { data: profile, error: pError } = await supabaseAdmin.from('profiles').select('*').eq('id', id).single();
    if (pError) throw pError;

    const { data: scores, error: sError } = await supabaseAdmin.from('scores').select('*').eq('user_id', id).order('played_at', { ascending: false });
    if (sError) throw sError;

    res.json({ data: { profile, scores } });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});


router.post('/users/:id', verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json({ data: profile });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});




router.get('/winners', verifyAdmin, async (_req, res) => {
  try {
    const { data: winners, error } = await supabaseAdmin
      .from('winners')
      .select('*, profiles(full_name, email), draws(month)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ data: winners });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});


router.post('/winners/:id/verify', verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, admin_note } = req.body;

    if (!['verified', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Status must be verified or rejected' });
    }

    const { data: winner, error } = await supabaseAdmin
      .from('winners')
      .update({
        status,
        admin_note,
        verified_at: status === 'verified' ? new Date().toISOString() : null
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json({ data: winner });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});


router.post('/winners/:id/payout', verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const { data: winner, error } = await supabaseAdmin
      .from('winners')
      .update({
        payment_status: 'paid',
        status: 'paid',
        paid_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json({ data: winner });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});




router.get('/charities', verifyAdmin, async (_req, res) => {
  try {
    const { data, error } = await supabaseAdmin.from('charities').select('*').order('name');
    if (error) throw error;
    res.json({ data });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});


router.post('/charities', verifyAdmin, async (req, res) => {
  try {
    const { id, ...data } = req.body;

    let result;
    if (id) {
      result = await supabaseAdmin.from('charities').update(data).eq('id', id).select().single();
    } else {
      result = await supabaseAdmin.from('charities').insert(data).select().single();
    }

    if (result.error) throw result.error;
    res.json({ data: result.data });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

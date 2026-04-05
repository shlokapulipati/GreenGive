import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) console.warn('⚠️  SUPABASE_URL not set — database features disabled');
if (!supabaseKey) console.warn('⚠️  SUPABASE_SERVICE_ROLE_KEY not set — database features disabled');



export const supabaseAdmin: any = (supabaseUrl && supabaseKey)
  ? createClient(supabaseUrl, supabaseKey)
  : new Proxy({}, {
      get: () => () => ({ data: null, error: new Error('Supabase not configured. Add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to .env') })
    });

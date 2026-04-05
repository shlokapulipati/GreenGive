
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (url && key) {
    return createBrowserClient(url, key);
  }

  
  const dummyChain: any = new Proxy(function() {}, {
    get: (target, prop) => {
      
      if (prop === 'then') {
        return (resolve: any) => resolve({ data: [], error: null });
      }
      return dummyChain;
    },
    apply: () => dummyChain
  });

  return {
    auth: {
      getUser: async () => ({ data: { user: null }, error: null }),
      getSession: async () => ({ data: { session: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      signInWithPassword: async () => ({ data: null, error: new Error('Supabase keys missing in .env.local') }),
      signUp: async () => ({ data: null, error: new Error('Supabase keys missing in .env.local') }),
      signOut: async () => ({ error: null })
    },
    from: () => dummyChain,
    storage: {
      from: () => dummyChain
    }
  } as any;
}
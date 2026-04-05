
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const dummyChain: any = new Proxy(function() {}, {
  get: (target, prop) => {
    if (prop === 'then') {
      return (resolve: any) => resolve({ data: [], error: null });
    }
    return dummyChain;
  },
  apply: () => dummyChain
});

const dummyClient = {
  auth: {
    getUser: async () => ({ data: { user: null }, error: null }),
    getSession: async () => ({ data: { session: null }, error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    signInWithPassword: async () => ({ data: null, error: new Error('Supabase keys missing') }),
    signUp: async () => ({ data: null, error: new Error('Supabase keys missing') }),
    signOut: async () => ({ error: null })
  },
  from: () => dummyChain,
  storage: {
    from: () => dummyChain
  }
} as any;

export async function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return dummyClient;
  }

  const cookieStore = await cookies()
  return createServerClient(url, key, {
    cookies: {
      getAll() { return cookieStore.getAll() },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        } catch {}
      },
    },
  })
}

export async function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    return dummyClient;
  }

  const cookieStore = await cookies()
  return createServerClient(url, key, {
    cookies: {
      getAll() { return cookieStore.getAll() },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        } catch {}
      },
    },
  })
}
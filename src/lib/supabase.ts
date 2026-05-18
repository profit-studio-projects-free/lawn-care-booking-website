import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { DEMO_DATA } from './demoData'

const rawUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
const rawKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

function looksLikePlaceholder(v?: string): boolean {
  if (!v) return true
  const s = v.trim()
  if (s.length === 0) return true
  const lower = s.toLowerCase()
  return (
    lower.includes('paste_your') ||
    lower.includes('your_supabase') ||
    lower.includes('your-project') ||
    lower === 'undefined' ||
    lower === 'null'
  )
}

function envIsValid(url?: string, key?: string): boolean {
  if (looksLikePlaceholder(url) || looksLikePlaceholder(key)) return false
  try {
    const u = new URL(url!)
    return u.protocol === 'https:' || u.protocol === 'http:'
  } catch {
    return false
  }
}

export const isSupabaseConfigured = envIsValid(rawUrl, rawKey)

/**
 * Build a chainable stub that mimics enough of the Supabase JS client surface
 * so existing component code (.from(...).select().eq().order().limit().maybeSingle(),
 * .insert(), .update().eq(), .delete().eq(), auth helpers) keeps working with
 * safe in-memory demo data when env vars are missing.
 *
 * This is only used when isSupabaseConfigured === false. When the env vars are
 * present, the real Supabase client is used unchanged.
 */
function buildStubClient(): SupabaseClient {
  type Filter = { col: string; val: any }
  type Order = { col: string; asc: boolean }

  function applyFilters(rows: any[], filters: Filter[]) {
    return filters.reduce(
      (acc, f) => acc.filter((r: any) => r?.[f.col] === f.val),
      rows.slice()
    )
  }

  function applyOrders(rows: any[], orders: Order[]) {
    if (!orders.length) return rows
    const out = rows.slice()
    out.sort((a: any, b: any) => {
      for (const o of orders) {
        const av = a?.[o.col]
        const bv = b?.[o.col]
        if (av === bv) continue
        if (av == null) return 1
        if (bv == null) return -1
        if (av < bv) return o.asc ? -1 : 1
        if (av > bv) return o.asc ? 1 : -1
      }
      return 0
    })
    return out
  }

  function makeSelect(
    table: string,
    filters: Filter[] = [],
    orders: Order[] = [],
    lim?: number
  ): any {
    const exec = async () => {
      let rows = applyFilters(DEMO_DATA[table] ?? [], filters)
      rows = applyOrders(rows, orders)
      if (lim !== undefined) rows = rows.slice(0, lim)
      return { data: rows, error: null }
    }
    const q: any = {
      select: () => makeSelect(table, filters, orders, lim),
      eq: (col: string, val: any) =>
        makeSelect(table, [...filters, { col, val }], orders, lim),
      order: (col: string, opts?: { ascending?: boolean }) =>
        makeSelect(
          table,
          filters,
          [...orders, { col, asc: opts?.ascending !== false }],
          lim
        ),
      limit: (n: number) => makeSelect(table, filters, orders, n),
      maybeSingle: async () => {
        const r = await exec()
        return { data: r.data[0] ?? null, error: null }
      },
      single: async () => {
        const r = await exec()
        return { data: r.data[0] ?? null, error: null }
      },
      then: (resolve: any, reject: any) => exec().then(resolve, reject),
    }
    return q
  }

  function makeMutation(): any {
    const op = async () => ({ data: null, error: null })
    const m: any = {
      eq: () => makeMutation(),
      then: (resolve: any, reject: any) => op().then(resolve, reject),
    }
    return m
  }

  const stub: any = {
    from: (table: string) => {
      const q: any = makeSelect(table)
      q.insert = async () => ({ data: null, error: null })
      q.update = () => makeMutation()
      q.delete = () => makeMutation()
      return q
    },
    auth: {
      getSession: async () => ({ data: { session: null }, error: null }),
      getUser: async () => ({ data: { user: null }, error: null }),
      signInWithPassword: async () => ({
        data: { session: null, user: null },
        error: {
          message:
            'Supabase is not connected yet. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env to enable admin sign in.',
        },
      }),
      signOut: async () => ({ error: null }),
      onAuthStateChange: () => ({
        data: { subscription: { unsubscribe() {} } },
      }),
    },
  }

  return stub as SupabaseClient
}

function buildRealClient(url: string, key: string): SupabaseClient {
  return createClient(url, key, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  })
}

let client: SupabaseClient
if (isSupabaseConfigured) {
  try {
    client = buildRealClient(rawUrl!, rawKey!)
  } catch (err) {
    // If real client construction fails for any reason, fall back gracefully.
    // eslint-disable-next-line no-console
    console.warn(
      '[Verdant] Failed to initialize Supabase client. Falling back to demo mode.',
      err
    )
    client = buildStubClient()
  }
} else {
  // eslint-disable-next-line no-console
  console.info(
    '[Verdant] Supabase env vars are missing — running in demo/fallback mode. ' +
      'Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env to enable the real backend.'
  )
  client = buildStubClient()
}

export const supabase: SupabaseClient = client

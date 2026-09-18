import { createClient } from '@supabase/supabase-js'

export function supabasePublico() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
}

// Cliente "admin" — usado apenas dentro das rotas de API (servidor),
// nunca no navegador. Usa a service role key, que ignora RLS.
export function supabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )
}

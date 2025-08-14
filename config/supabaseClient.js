import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

function pickEnv(...names) {
  for (const n of names) {
    const v = process.env[n];
    if (v && String(v).trim()) return String(v).trim();
  }
  return '';
}

const SUPABASE_URL = pickEnv('SUPABASE_URL', 'VITE_SUPABASE_URL');
const SERVICE_ROLE_KEY = pickEnv('SUPABASE_SERVICE_ROLE_KEY');
const PUBLIC_KEY = pickEnv('SUPABASE_ANON_KEY', 'VITE_SUPABASE_ANON_KEY', 'SUPABASE_API_KEY', 'SUPABASE_KEY');

if (!SUPABASE_URL) {
  throw new Error('Supabase configuration missing. Please set SUPABASE_URL');
}
if (!SERVICE_ROLE_KEY && !PUBLIC_KEY) {
  throw new Error('Supabase configuration missing. Provide SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY');
}

// Admin client (bypasses RLS) → default export for DB/storage writes
const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY || PUBLIC_KEY, {
  auth: { persistSession: false },
});

// Public client (RLS enforced) → for auth.getUser, etc.
const supabaseAuth = createClient(SUPABASE_URL, PUBLIC_KEY || SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

console.log('SUPABASE_URL:', SUPABASE_URL);
console.log('Supabase clients initialized:', {
  adminKey: SERVICE_ROLE_KEY ? 'SERVICE_ROLE' : 'PUBLIC_FALLBACK',
  authKey: PUBLIC_KEY ? 'ANON/API' : 'SERVICE_ROLE_FALLBACK',
});

export default supabaseAdmin;
export { supabaseAdmin, supabaseAuth };
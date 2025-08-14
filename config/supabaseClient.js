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
// Prefer service role on backend; fallback to API/anon if not provided
const SUPABASE_KEY = pickEnv(
  'SUPABASE_SERVICE_ROLE_KEY',
  'SUPABASE_API_KEY',
  'SUPABASE_KEY',
  'SUPABASE_ANON_KEY',
  'VITE_SUPABASE_ANON_KEY'
);

if (!SUPABASE_URL || !SUPABASE_KEY) {
  throw new Error('Supabase configuration missing. Please set SUPABASE_URL and a key (SUPABASE_SERVICE_ROLE_KEY or SUPABASE_API_KEY or SUPABASE_ANON_KEY).');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
console.log('SUPABASE_URL:', SUPABASE_URL);
export default supabase;
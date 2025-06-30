import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();
console.log("SUPABASE_URL:", process.env.SUPABASE_URL);
console.log("SUPABASE_KEY:", process.env.SUPABASE_KEY);
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

export default supabase;
// Este codigo NO SE TOCA. Simplemente se inicializa el cliente de Supabase y se exporta para ser utilizado en otras partes de la aplicación.
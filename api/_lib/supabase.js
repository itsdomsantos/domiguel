import { createClient } from '@supabase/supabase-js';

// Cliente Supabase com a SERVICE ROLE KEY — apenas no servidor (funções
// serverless). Nunca expor esta chave no frontend.
const url = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

export const BUCKET = process.env.SUPABASE_BUCKET || 'project-images';

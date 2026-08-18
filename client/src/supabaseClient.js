import { createClient } from '@supabase/supabase-js';

// Cliente Supabase para o browser — usa a ANON KEY (pública, pode ir no frontend).
// Usado apenas para enviar imagens para o Storage via URL assinado.
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
  { auth: { persistSession: false } }
);

export const BUCKET = import.meta.env.VITE_SUPABASE_BUCKET || 'project-images';

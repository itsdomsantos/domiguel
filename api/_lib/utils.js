import { supabase } from './supabase.js';

export function slugify(text) {
  return String(text)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Garante um slug único na tabela projects (async, contra o Supabase).
export async function uniqueSlug(base, ignoreId = null) {
  let slug = base || 'projeto';
  let n = 1;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    let query = supabase.from('projects').select('id').eq('slug', slug);
    if (ignoreId) query = query.neq('id', ignoreId);
    const { data } = await query.maybeSingle();
    if (!data) return slug;
    n += 1;
    slug = `${base}-${n}`;
  }
}

// Normaliza tags que podem vir como string (vírgulas) ou array.
export function normalizeTags(tags) {
  if (Array.isArray(tags)) return tags.map((t) => String(t).trim()).filter(Boolean);
  if (typeof tags === 'string') {
    return tags.split(',').map((t) => t.trim()).filter(Boolean);
  }
  return [];
}

// Garante forma consistente das linhas devolvidas.
export function serialize(row) {
  if (!row) return row;
  return { ...row, tags: row.tags || [] };
}

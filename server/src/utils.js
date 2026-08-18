export function slugify(text) {
  return String(text)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function uniqueSlug(db, base, ignoreId = null) {
  let slug = base || 'projeto';
  let n = 1;
  while (true) {
    const row = ignoreId
      ? db.prepare('SELECT id FROM projects WHERE slug = ? AND id != ?').get(slug, ignoreId)
      : db.prepare('SELECT id FROM projects WHERE slug = ?').get(slug);
    if (!row) return slug;
    n += 1;
    slug = `${base}-${n}`;
  }
}

// Normaliza tags que podem vir como string separada por vírgulas ou array.
export function normalizeTags(tags) {
  if (Array.isArray(tags)) return tags.map((t) => String(t).trim()).filter(Boolean);
  if (typeof tags === 'string') {
    return tags.split(',').map((t) => t.trim()).filter(Boolean);
  }
  return [];
}

export function normalizeQuery(q) {
  return q.trim().toLowerCase().replace(/[^\w\s-]/g, "");
}

export async function loadAliases() {
  try {
    const res = await fetch("data/aliases/aliases.json");
    if (!res.ok) return {};
    return await res.json();
  } catch {
    return {};
  }
}

export function applyAlias(query, aliases) {
  const exact = aliases[query] || null;
  if (exact) return exact;
  const entries = Object.entries(aliases);
  for (const [k, v] of entries) {
    if (k.toLowerCase() === query) return v;
  }
  return null;
}

function normalizeVariants(s) {
  // Normalize common UK/US variants and morphological endings
  // Order matters: handle longer suffixes before shorter ones
  let x = s;
  // British to American spelling: -isation -> -ization, -ise -> -ize
  x = x.replace(/isation\b/g, "ization");
  x = x.replace(/isations\b/g, "izations");
  x = x.replace(/ising\b/g, "izing");
  x = x.replace(/ised\b/g, "ized");
  x = x.replace(/ises\b/g, "izes");
  x = x.replace(/ise\b/g, "ize");

  // Light stemming for common nominalizations
  x = x.replace(/izations\b/g, "ization");
  x = x.replace(/ization\b/g, "ize");
  x = x.replace(/izing\b/g, "ize");
  x = x.replace(/ized\b/g, "ize");

  return x;
}

export function normalizeQuery(q) {
  const base = q.trim().toLowerCase().replace(/[^\w\s-]/g, "");
  return normalizeVariants(base);
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

const SEVERITY_RULES = [
  { level: "Critical", keywords: ["crash", "data loss", "security", "cannot log in", "payment fail"] },
  { level: "High", keywords: ["error", "exception", "broken", "not working", "fails"] },
  { level: "Medium", keywords: ["incorrect", "unexpected", "mismatch", "wrong"] },
  { level: "Low", keywords: ["typo", "misaligned", "cosmetic", "spacing", "color"] }
];

export function suggestSeverity(text = "") {
  const lower = text.toLowerCase();
  for (const rule of SEVERITY_RULES) {
    if (rule.keywords.some((k) => lower.includes(k))) return rule.level;
  }
  return "Medium"; // default when nothing matches
}

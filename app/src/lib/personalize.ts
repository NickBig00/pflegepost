/** German genitive for a name: "Mama" → "Mamas", "Klaus" → "Klaus’". */
export function genitive(name: string): string {
  return /[sßxz]$/i.test(name) ? `${name}’` : `${name}s`;
}

/** Replaces the demo's "Mama"/"Mamas" with the name chosen in onboarding. */
export function personalize(text: string, caseName: string): string {
  if (caseName === 'Mama') return text;
  return text.replace(/\bMamas\b/g, genitive(caseName)).replace(/\bMama\b/g, caseName);
}

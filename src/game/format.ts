// Locale-stable formatter so SSR and client agree (no hydration mismatch).
const nf = new Intl.NumberFormat("en-US");
export const fmt = (n: number) => nf.format(Math.round(n));
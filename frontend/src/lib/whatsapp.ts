/**
 * Build a wa.me deep link.
 * Number is normalized: digits-only, leading 0 stripped and replaced with 62 (Indonesia).
 * Returns null when the number is missing or too short to be valid.
 */
export function whatsappLink(
  phone: string | null | undefined,
  message?: string,
): string | null {
  if (!phone) return null;
  let digits = String(phone).replace(/\D/g, '');
  if (!digits) return null;
  if (digits.startsWith('0')) digits = '62' + digits.slice(1);
  if (digits.length < 8) return null;
  const base = `https://wa.me/${digits}`;
  if (!message) return base;
  return `${base}?text=${encodeURIComponent(message)}`;
}

/**
 * Extract the S3 object key from a stored value. Rows now store the absolute
 * file_url (e.g. `http://host/uploads/payments/abc.png`) but legacy rows may
 * still contain the bare key (e.g. `payments/abc.png`). Handle both.
 */
export function s3KeyFromUrl(input: string): string {
  if (/^https?:\/\//i.test(input)) {
    try {
      const u = new URL(input);
      return u.pathname.replace(/^\/+uploads\/+/, '');
    } catch {
      return input;
    }
  }
  return input.replace(/^\/+/, '');
}

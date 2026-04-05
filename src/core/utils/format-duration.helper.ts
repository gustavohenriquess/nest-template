/**
 * Formats a duration in seconds into a human-readable string (Years, Months, Days, Hours, Minutes, Seconds).
 *
 * @param seconds The duration in seconds.
 * @returns A human-readable string representation of the duration.
 */
export function formatDuration(seconds: number): string {
  if (seconds < 0) return '0s';
  if (seconds === 0) return '0s';

  let remaining = seconds;

  const years = Math.floor(remaining / (365 * 24 * 60 * 60));
  remaining %= 365 * 24 * 60 * 60;

  const months = Math.floor(remaining / (30 * 24 * 60 * 60));
  remaining %= 30 * 24 * 60 * 60;

  const days = Math.floor(remaining / (24 * 60 * 60));
  remaining %= 24 * 60 * 60;

  const hours = Math.floor(remaining / (60 * 60));
  remaining %= 60 * 60;

  const minutes = Math.floor(remaining / 60);
  remaining %= 60;

  const secs = Math.floor(remaining);

  const parts: string[] = [];

  if (years > 0) parts.push(`${years}y`);
  if (months > 0) parts.push(`${months}mo`);
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);

  return parts.join(' ');
}

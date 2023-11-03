/**
 * Format a duration in "minutes:seconds"
 */
export function secondsToString(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const secondes = Math.round(seconds % 60)
    .toString()
    .padStart(2, "0");
  return `${minutes}:${secondes}`;
}

export function msToDuration(inputMs: number): string {
  const ms = inputMs % 1000;
  const seconds = Math.floor((inputMs / 1000) % 60);
  const minutes = Math.floor((inputMs / (1000 * 60)) % 60);

  return `${minutes}:${seconds}.${ms}`;
}

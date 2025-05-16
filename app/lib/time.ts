export function msToDuration(
  inputMs: number,
  includeHours: boolean = false
): string {
  const ms = inputMs % 1000;
  const seconds = Math.floor((inputMs / 1000) % 60);
  const minutes = Math.floor((inputMs / (1000 * 60)) % 60);
  const hours = Math.floor((inputMs / (1000 * 60 * 60)) % 24);

  return `${hours ? hours + ":" : ""}${minutes}:${seconds}.${ms}`;
}

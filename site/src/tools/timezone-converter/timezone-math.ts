// Interpret a wall clock reading in its named IANA zone, not in the browser zone.
// Reject nonexistent DST times; when a clock repeats, choose the earlier instant.
function wallParts(date: Date, zone: string): string | null {
  try {
    const parts = new Intl.DateTimeFormat("en-GB", {
      timeZone: zone, year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit", hourCycle: "h23",
    }).formatToParts(date);
    const p = Object.fromEntries(parts.map(part => [part.type, part.value]));
    return `${p.year?.padStart(4, "0")}-${p.month}-${p.day}T${p.hour}:${p.minute}`;
  } catch { return null; }
}

export function nowInZone(zone: string, date = new Date()): string {
  return wallParts(date, zone) ?? "";
}

function wallEpoch(wall: string): number {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(wall)) return NaN;
  const ms = Date.parse(wall + ":00Z");
  if (!Number.isFinite(ms) || new Date(ms).toISOString().slice(0, 16) !== wall) return NaN;
  return ms;
}

export function resolveWallTime(wall: string, zone: string): Date | null {
  const desired = wallEpoch(wall);
  if (!Number.isFinite(desired)) return null;
  // Sample both sides of a potential offset transition. Match each candidate
  // by formatting back to the exact requested wall time, never silently shift.
  const offsets = new Set<number>();
  for (const hours of [-36, -24, -12, 0, 12, 24, 36]) {
    const probe = desired + hours * 3600000;
    const local = wallParts(new Date(probe), zone);
    if (!local) return null;
    const epoch = wallEpoch(local);
    if (Number.isFinite(epoch)) offsets.add(epoch - probe);
  }
  const matches = [...offsets].map(offset => desired - offset)
    .filter(ms => wallParts(new Date(ms), zone) === wall)
    .sort((a, b) => a - b);
  return matches.length ? new Date(matches[0]!) : null;
}

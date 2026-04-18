function pad(n: number): string {
  return String(n).padStart(2, '0');
}

export function isoRange(year: number, month?: number, day?: number): { start: string; end: string } {
  if (day !== undefined && month !== undefined) {
    const d = `${year}-${pad(month + 1)}-${pad(day)}`;
    return { start: `${d}T00:00:00`, end: `${d}T23:59:59` };
  }
  if (month !== undefined) {
    const lastDay = new Date(year, month + 1, 0).getDate();
    return {
      start: `${year}-${pad(month + 1)}-01T00:00:00`,
      end:   `${year}-${pad(month + 1)}-${pad(lastDay)}T23:59:59`,
    };
  }
  return { start: `${year}-01-01T00:00:00`, end: `${year}-12-31T23:59:59` };
}

export interface AnalyticsDateRange {
  startDate: string;
  endDate: string;
}

export function getAnalyticsDateRange(searchParams: URLSearchParams): AnalyticsDateRange {
  const today = new Date().toISOString().slice(0, 10);
  const from = searchParams.get('from');
  const to = searchParams.get('to');

  if (from && to) {
    const startDate = new Date(from);
    const endDate = new Date(to);
    if (
      Number.isNaN(startDate.getTime())
      || Number.isNaN(endDate.getTime())
      || startDate > endDate
    ) {
      throw new Error('Invalid analytics date range');
    }
    return {
      startDate: startDate.toISOString().slice(0, 10),
      endDate: endDate.toISOString().slice(0, 10),
    };
  }

  const parsedDays = Number(searchParams.get('days') || 30);
  const days = Number.isFinite(parsedDays) ? Math.max(1, Math.min(365, Math.floor(parsedDays))) : 30;
  const start = new Date(`${today}T00:00:00.000Z`);
  start.setUTCDate(start.getUTCDate() - days + 1);
  return { startDate: start.toISOString().slice(0, 10), endDate: today };
}

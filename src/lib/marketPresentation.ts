export function getMarketPresentation<T>(records: T[], examples: T[], loading: boolean): {
  source: "loading" | "records" | "demo";
  markets: T[];
} {
  if (loading) return { source: "loading", markets: [] };
  if (records.length) return { source: "records", markets: records };
  return { source: "demo", markets: examples };
}

export function getPriceSummary(markets: { price: number }[]): {
  highest: number | null;
  average: number | null;
} {
  if (!markets.length) return { highest: null, average: null };
  return {
    highest: Math.max(...markets.map((market) => market.price)),
    average: Math.round(markets.reduce((sum, market) => sum + market.price, 0) / markets.length),
  };
}

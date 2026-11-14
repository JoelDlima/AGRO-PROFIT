const kilogramsPerUnit: Record<string, number> = {
  kg: 1,
  quintal: 100,
  ton: 1000,
};

export function marketPricePerKg(commodity: string | undefined, selectedCrop: string, pricePerQuintal: number | undefined): number | null {
  if (!commodity || commodity.toLowerCase() !== selectedCrop.toLowerCase() ||
      pricePerQuintal === undefined || !Number.isFinite(pricePerQuintal) || pricePerQuintal <= 0) {
    return null;
  }
  return pricePerQuintal / 100;
}

export function calculatePrice(quantity: string, pricePerKg: string, unit: string): number | null {
  const multiplier = kilogramsPerUnit[unit];
  const qty = quantity.trim() ? Number(quantity) : NaN;
  const price = pricePerKg.trim() ? Number(pricePerKg) : NaN;
  if (!multiplier || !Number.isFinite(qty) || !Number.isFinite(price) || qty <= 0 || price <= 0) {
    return null;
  }
  const total = qty * multiplier * price;
  return Number.isFinite(total) ? total : null;
}

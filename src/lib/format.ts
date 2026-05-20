export function formatINR(amount: number | string | null | undefined): string {
  const n = Number(amount ?? 0);
  if (!Number.isFinite(n)) return "₹0";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
}

export function discountPct(price: number, discount?: number | null) {
  if (!discount || discount <= 0 || discount >= price) return 0;
  return Math.round(((price - discount) / price) * 100);
}

export function effectivePrice(price: number, discount?: number | null) {
  return discount && discount > 0 && discount < price ? discount : price;
}

// lib/utils/formatCurrency.ts

export function formatCurrency(
  amount: number | string,
  currency = "USD",
  locale = "en-US"
): string {
  const value = typeof amount === "string" ? parseFloat(amount) : amount;

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(value);
}
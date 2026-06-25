// lib/utils/formatDate.ts

export function formatDate(
  date: Date | string,
  options?: Intl.DateTimeFormatOptions
): string {
  const d = typeof date === "string" ? new Date(date) : date;

  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    ...options,
  }).format(d);
}

export function formatDateShort(date: Date | string): string {
  return formatDate(date, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: undefined,
    minute: undefined,
  });
}
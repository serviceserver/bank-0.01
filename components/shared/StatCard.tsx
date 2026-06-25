// components/shared/StatCard.tsx

interface StatCardProps {
  label: string;
  value: string;
  sub?: string;
  accent?: boolean;
}

export function StatCard({ label, value, sub, accent }: StatCardProps) {
  return (
    <div
      className={`
        rounded-xl border p-5 flex flex-col gap-1
        ${accent
          ? "bg-primary border-primary text-white"
          : "bg-surface border-border text-foreground"
        }
      `}
    >
      <p className={`text-xs font-medium uppercase tracking-wide
                     ${accent ? "text-blue-100" : "text-muted"}`}>
        {label}
      </p>
      <p className={`text-2xl font-bold ${accent ? "text-white" : "text-foreground"}`}>
        {value}
      </p>
      {sub && (
        <p className={`text-xs ${accent ? "text-blue-100" : "text-muted"}`}>
          {sub}
        </p>
      )}
    </div>
  );
}
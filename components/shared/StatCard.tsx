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
          ? "bg-slate-900 border-slate-900 text-white"
          : "bg-white border-gray-200 text-slate-900"
        }
      `}
    >
      <p className={`text-xs font-medium uppercase tracking-wide
                     ${accent ? "text-slate-400" : "text-gray-500"}`}>
        {label}
      </p>
      <p className={`text-2xl font-bold ${accent ? "text-white" : "text-slate-900"}`}>
        {value}
      </p>
      {sub && (
        <p className={`text-xs ${accent ? "text-slate-400" : "text-gray-500"}`}>
          {sub}
        </p>
      )}
    </div>
  );
}
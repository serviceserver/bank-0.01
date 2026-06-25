// components/ui/Badge.tsx

type BadgeVariant = "success" | "danger" | "warning" | "neutral" | "info";

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
}

const variants: Record<BadgeVariant, string> = {
  success: "bg-green-50 text-green-700 border-green-200",
  danger:  "bg-red-50 text-red-700 border-red-200",
  warning: "bg-yellow-50 text-yellow-700 border-yellow-200",
  neutral: "bg-gray-100 text-gray-600 border-gray-200",
  info:    "bg-blue-50 text-blue-700 border-blue-200",
};

export function Badge({ variant = "neutral", children }: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center px-2 py-0.5 rounded-full
        text-xs font-medium border ${variants[variant]}
      `}
    >
      {children}
    </span>
  );
}
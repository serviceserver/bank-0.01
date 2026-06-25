// components/ui/Badge.tsx

type BadgeVariant = "success" | "danger" | "warning" | "neutral" | "info";

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const variants: Record<BadgeVariant, string> = {
  success: "bg-success/10 text-success border-success/20",
  danger:  "bg-danger/10 text-danger border-danger/20",
  warning: "bg-warning/10 text-warning border-warning/20",
  neutral: "bg-muted/10 text-muted border-border",
  info:    "bg-accent/10 text-accent border-accent/20",
};

export function Badge({ variant = "neutral", children, className }: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center px-2 py-0.5 rounded-full
        text-xs font-medium border ${variants[variant]} ${className ?? ""}
      `}
    >
      {children}
    </span>
  );
}
// components/ui/Card.tsx

import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: "none" | "sm" | "md" | "lg";
}

const paddings = {
  none: "",
  sm:   "p-4",
  md:   "p-6",
  lg:   "p-8",
};

export function Card({ children, className = "", padding = "md" }: CardProps) {
  return (
    <div
      className={`
        bg-white border border-gray-200 rounded-xl shadow-sm
        ${paddings[padding]} ${className}
      `}
    >
      {children}
    </div>
  );
}
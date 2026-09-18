import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: "sm" | "md" | "lg";
}

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-paper text-ink border border-graphite hover:bg-[#d5d2cc] active:scale-[0.98]",
  secondary:
    "bg-charcoal text-paper border border-graphite hover:bg-[#252525]",
  danger:
    "bg-brick text-paper border border-[#8a3631] hover:bg-[#963f3a]",
  ghost: "bg-transparent text-ash border border-transparent hover:border-graphite",
};

const sizes = {
  sm: "px-3 py-2 text-sm min-h-[40px]",
  md: "px-4 py-3 text-base min-h-[44px]",
  lg: "px-6 py-4 text-lg min-h-[52px] font-semibold",
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-paper disabled:opacity-40 disabled:pointer-events-none",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  );
}

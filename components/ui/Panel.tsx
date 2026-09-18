import { cn } from "@/lib/utils";

export function Panel({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-lg border border-graphite bg-charcoal p-4 md:p-6",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function Label({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "text-xs uppercase tracking-widest text-ash font-mono",
        className,
      )}
    >
      {children}
    </span>
  );
}

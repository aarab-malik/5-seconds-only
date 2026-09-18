import { cn } from "@/lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export function Input({ className, ...props }: InputProps) {
  return (
    <input
      className={cn(
        "w-full rounded-md border border-graphite bg-charcoal px-4 py-3 text-paper placeholder:text-ash focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-paper min-h-[44px]",
        className,
      )}
      {...props}
    />
  );
}

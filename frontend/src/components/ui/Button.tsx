import {
  ButtonHTMLAttributes,
  forwardRef,
} from "react";

import { cn } from "@/lib/utils";

interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
}

export const Button = forwardRef<
  HTMLButtonElement,
  ButtonProps
>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-xl font-medium transition",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500",
          "disabled:pointer-events-none disabled:opacity-50",

          variant === "primary" &&
            "bg-orange-500 text-white hover:bg-orange-600",

          variant === "secondary" &&
            "border border-zinc-200 bg-white text-zinc-900 hover:bg-zinc-50",

          variant === "ghost" &&
            "text-zinc-700 hover:bg-zinc-100",

          size === "sm" && "h-9 px-3 text-sm",
          size === "md" && "h-11 px-5 text-sm",
          size === "lg" && "h-12 px-6",

          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";
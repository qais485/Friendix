import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-full text-sm font-semibold ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.97] select-none",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-primary to-purple-500 text-primary-foreground shadow-glow hover:shadow-glow-lg hover:opacity-95",
        destructive: "bg-gradient-to-r from-red-500 to-rose-500 text-destructive-foreground shadow-lg hover:opacity-95",
        outline: "border border-border/60 bg-card/60 backdrop-blur-md text-foreground hover:bg-card/80 hover:shadow-card",
        secondary: "bg-muted/60 backdrop-blur-sm text-secondary-foreground hover:bg-muted/80",
        ghost: "hover:bg-muted/60 hover:backdrop-blur-sm text-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        glow: "bg-primary text-primary-foreground shadow-glow hover:shadow-glow-lg hover:bg-primary/90",
        gradient: "bg-gradient-to-r from-primary via-purple-500 to-pink-500 text-primary-foreground shadow-glow hover:shadow-glow-lg hover:opacity-95",
        glass: "bg-card/60 backdrop-blur-md border border-white/20 text-foreground hover:bg-card/80 shadow-card",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-9 rounded-full px-3.5 text-xs",
        lg: "h-11 rounded-full px-7",
        xl: "h-12 rounded-full px-9 text-base",
        icon: "h-10 w-10 rounded-full",
        "icon-sm": "h-8 w-8 rounded-full",
        "icon-lg": "h-12 w-12 rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };

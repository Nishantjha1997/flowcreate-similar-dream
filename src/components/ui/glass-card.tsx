import * as React from "react"
import { cn } from "@/lib/utils"

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated" | "subtle"
  neoBrutalism?: boolean
}

const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, variant = "default", neoBrutalism = false, ...props }, ref) => {
    const defaultVariants = {
      default: "backdrop-blur-xl bg-card/90 dark:bg-card/80 border border-border/50 shadow-xl text-card-foreground",
      elevated: "backdrop-blur-2xl bg-card/95 dark:bg-card/85 border border-border/60 shadow-2xl text-card-foreground",
      subtle: "backdrop-blur-lg bg-card/70 dark:bg-card/60 border border-border/30 shadow-lg text-card-foreground"
    }

    const neoBrutalismVariants = {
      default: "bg-card border-[3px] border-foreground shadow-[4px_4px_0px_0px_hsl(var(--foreground))] text-card-foreground",
      elevated: "bg-card border-[4px] border-foreground shadow-[6px_6px_0px_0px_hsl(var(--foreground))] text-card-foreground",
      subtle: "bg-card border-2 border-foreground shadow-[3px_3px_0px_0px_hsl(var(--foreground))] text-card-foreground"
    }

    const variants = neoBrutalism ? neoBrutalismVariants : defaultVariants

    return (
      <div
        ref={ref}
        className={cn(
          neoBrutalism 
            ? "rounded-none transition-all duration-200 hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[8px_8px_0px_0px_hsl(var(--foreground))]"
            : "rounded-xl transition-all duration-300 hover:shadow-2xl",
          variants[variant],
          className
        )}
        {...props}
      />
    )
  }
)
GlassCard.displayName = "GlassCard"

export { GlassCard }

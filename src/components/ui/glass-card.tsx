
import * as React from "react"
import { cn } from "@/lib/utils"

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated" | "subtle"
}

const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, variant = "default", ...props }, ref) => {
    const variants = {
      default: "backdrop-blur-xl bg-white/80 border border-white/20 shadow-xl",
      elevated: "backdrop-blur-2xl bg-white/90 border border-white/30 shadow-2xl",
      subtle: "backdrop-blur-lg bg-white/60 border border-white/10 shadow-lg"
    }

    return (
      <div
        ref={ref}
        className={cn(
          "rounded-xl transition-all duration-300 hover:shadow-2xl hover:bg-white/85",
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

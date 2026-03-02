import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        /* Teal — confiance, validé, actif */
        teal:
          "bg-teal-100 text-teal-500 border-teal-200",
        /* Coral — action, urgent, CTA badge */
        coral:
          "bg-coral-100 text-coral-500 border-coral-200",
        /* Sand — chaleur, accueil, onboarding */
        sand:
          "bg-sand-100 text-sand-700 border-sand-100",
        success:
          "bg-[hsl(var(--emerald)/0.12)] text-[hsl(var(--emerald))] border-[hsl(var(--emerald)/0.20)]",
        warning:
          "bg-[hsl(var(--amber)/0.12)] text-[hsl(var(--amber))] border-[hsl(var(--amber)/0.20)]",
        info:
          "bg-teal-100 text-teal-500 border-teal-200",
        error:
          "bg-coral-100 text-coral-500 border-coral-200",
        quiet:
          "bg-muted text-muted-foreground border-transparent",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
  VariantProps<typeof badgeVariants> { }

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }

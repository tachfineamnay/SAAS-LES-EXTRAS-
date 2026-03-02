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
          "bg-[hsl(var(--teal-light))] text-[hsl(var(--teal))] border-[hsl(var(--teal)/0.2)]",
        /* Coral — action, urgent, CTA badge */
        coral:
          "bg-[hsl(var(--coral-light))] text-[hsl(var(--coral))] border-[hsl(var(--coral)/0.2)]",
        /* Sand — chaleur, accueil, onboarding */
        sand:
          "bg-[hsl(var(--sand-light))] text-[hsl(var(--sand))] border-[hsl(var(--sand)/0.2)]",
        success:
          "bg-[hsl(var(--emerald-light))] text-[hsl(var(--emerald))] border-[hsl(var(--emerald)/0.2)]",
        warning:
          "bg-[hsl(var(--amber-light))] text-[hsl(var(--amber))] border-[hsl(var(--amber)/0.2)]",
        info:
          "bg-[hsl(var(--violet-light))] text-[hsl(var(--violet))] border-[hsl(var(--violet)/0.2)]",
        error:
          "bg-[hsl(var(--coral-light))] text-[hsl(var(--coral))] border-[hsl(var(--coral)/0.2)]",
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

"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const glassCardVariants = cva(
    "rounded-lg text-card-foreground transition-all duration-200",
    {
        variants: {
            variant: {
                /* Surface glass — fond dark chaud avec teinture teal subtile */
                glass:
                    "glass-dark border-0 shadow-warm-card",
                /* Surface pleine — card standard */
                solid:
                    "bg-card border border-border shadow-warm-card",
                /* Surface interactive — hover lift + glow teal */
                interactive:
                    "glass-dark border-0 shadow-warm-card hover:-translate-y-0.5 hover:shadow-warm-card-lg hover:border hover:border-teal-200 focus-within:ring-2 focus-within:ring-ring cursor-pointer",
                /* Surface teal — widget primary, KPI actif */
                teal:
                    "glass-teal shadow-glow-teal",
                /* Surface coral — widget action urgente */
                coral:
                    "glass-coral-accent shadow-glow-coral",
            },
        },
        defaultVariants: {
            variant: "solid",
        },
    }
);

export interface GlassCardProps
    extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof glassCardVariants> {
    asChild?: boolean;
}

const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
    ({ className, variant, ...props }, ref) => (
        <div
            ref={ref}
            className={cn(glassCardVariants({ variant }), className)}
            {...props}
        />
    )
);
GlassCard.displayName = "GlassCard";

const GlassCardHeader = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn("flex flex-col space-y-1.5 p-6", className)}
        {...props}
    />
));
GlassCardHeader.displayName = "GlassCardHeader";

const GlassCardContent = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
));
GlassCardContent.displayName = "GlassCardContent";

const GlassCardFooter = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn("flex items-center p-6 pt-0", className)}
        {...props}
    />
));
GlassCardFooter.displayName = "GlassCardFooter";

export {
    GlassCard,
    GlassCardHeader,
    GlassCardContent,
    GlassCardFooter,
    glassCardVariants,
};

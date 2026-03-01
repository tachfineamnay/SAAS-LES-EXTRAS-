"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const glassCardVariants = cva(
    "rounded-lg text-card-foreground transition-all duration-200",
    {
        variants: {
            variant: {
                glass:
                    "bg-white/60 backdrop-blur-xl border border-white/80 shadow-[0_8px_30px_#0000000a]",
                solid: "bg-card border border-border shadow-sm",
                interactive:
                    "bg-white/60 backdrop-blur-xl border border-white/80 shadow-[0_8px_30px_#0000000a] hover:-translate-y-1 hover:shadow-[0_12px_40px_#00000014] focus-within:ring-2 focus-within:ring-ring cursor-pointer",
            },
        },
        defaultVariants: {
            variant: "glass",
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

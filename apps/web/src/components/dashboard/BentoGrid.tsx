"use client";

import { cn } from "@/lib/utils";
import { ReactNode, useCallback } from "react";

type BentoGridProps = {
    children: ReactNode;
    className?: string;
    compact?: boolean;
};

type BentoCardProps = {
    children: ReactNode;
    className?: string;
    colSpan?: 1 | 2 | 3;
    rowSpan?: 1 | 2;
    title?: string;
    description?: string;
    icon?: ReactNode;
    action?: ReactNode;
    variant?: "glass" | "solid" | "interactive";
};

export function BentoGrid({ children, className, compact }: BentoGridProps) {
    return (
        <div
            className={cn(
                "grid grid-cols-1 md:grid-cols-3 gap-4",
                compact ? "auto-rows-[minmax(120px,auto)]" : "auto-rows-[minmax(160px,auto)]",
                className
            )}
        >
            {children}
        </div>
    );
}

const variantClasses: Record<NonNullable<BentoCardProps["variant"]>, string> = {
    glass:
        "glass-panel glass-highlight border border-white/30 shadow-glass",
    solid:
        "bg-card border border-border shadow-sm",
    interactive:
        "glass-panel glass-highlight card-spotlight border border-white/30 shadow-glass hover:-translate-y-0.5 hover:shadow-glass-lg hover:border-[hsl(var(--teal)/0.2)] cursor-pointer focus-within:ring-2 focus-within:ring-ring",
};

export function BentoCard({
    children,
    className,
    colSpan = 1,
    rowSpan = 1,
    title,
    description,
    icon,
    action,
    variant = "glass",
}: BentoCardProps) {
    const handleMouseMove = useCallback(
        (e: React.MouseEvent<HTMLDivElement>) => {
            if (variant !== "interactive") return;
            const rect = e.currentTarget.getBoundingClientRect();
            e.currentTarget.style.setProperty("--mouse-x", `${e.clientX - rect.left}px`);
            e.currentTarget.style.setProperty("--mouse-y", `${e.clientY - rect.top}px`);
        },
        [variant]
    );

    return (
        <div
            className={cn(
                "group relative overflow-hidden rounded-2xl p-5 transition-all duration-200",
                variantClasses[variant],
                colSpan === 2 && "md:col-span-2",
                colSpan === 3 && "md:col-span-3",
                rowSpan === 2 && "md:row-span-2",
                className
            )}
            onMouseMove={handleMouseMove}
        >
            <div className="relative z-10 flex flex-col h-full">
                {(title || icon) && (
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-2.5">
                            {icon && (
                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
                                    {icon}
                                </div>
                            )}
                            {title && (
                                <div>
                                    <h3 className="font-semibold text-base tracking-tight text-card-foreground leading-tight">
                                        {title}
                                    </h3>
                                    {description && (
                                        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
                                    )}
                                </div>
                            )}
                        </div>
                        {action && <div className="shrink-0">{action}</div>}
                    </div>
                )}
                <div className="flex-1 min-h-0">{children}</div>
            </div>
        </div>
    );
}

import * as React from "react";
import { cn } from "@/lib/utils";

export interface BentoSectionProps extends React.HTMLAttributes<HTMLElement> {
    cols?: 2 | 3 | 4;
    gap?: "sm" | "md" | "lg";
    heading?: string;
    description?: string;
    action?: React.ReactNode;
}

const gapMap = {
    sm: "gap-3",
    md: "gap-4",
    lg: "gap-6",
} as const;

const colsMap = {
    2: "md:grid-cols-2",
    3: "md:grid-cols-2 lg:grid-cols-3",
    4: "md:grid-cols-2 xl:grid-cols-4",
} as const;

export function BentoSection({
    cols = 3,
    gap = "md",
    heading,
    description,
    action,
    className,
    children,
    ...props
}: BentoSectionProps) {
    return (
        <section className={cn("space-y-4", className)} {...props}>
            {(heading || action) && (
                <div className="flex items-end justify-between gap-4">
                    <div className="space-y-1">
                        {heading && (
                            <h3 className="text-xl font-semibold text-foreground">
                                {heading}
                            </h3>
                        )}
                        {description && (
                            <p className="text-sm text-muted-foreground">{description}</p>
                        )}
                    </div>
                    {action && <div className="shrink-0">{action}</div>}
                </div>
            )}
            <div
                className={cn(
                    "grid grid-cols-1",
                    colsMap[cols],
                    gapMap[gap]
                )}
            >
                {children}
            </div>
        </section>
    );
}

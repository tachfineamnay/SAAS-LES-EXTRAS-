import { cn } from "@/lib/utils";
import { ReactNode } from "react";

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
        "bg-card/70 backdrop-blur-[12px] border border-border/40 shadow-sm",
    solid:
        "bg-card border border-border shadow-sm",
    interactive:
        "bg-card border border-border shadow-sm hover:-translate-y-0.5 hover:shadow-md cursor-pointer focus-within:ring-2 focus-within:ring-ring",
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
        >
            <div className="flex flex-col h-full">
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

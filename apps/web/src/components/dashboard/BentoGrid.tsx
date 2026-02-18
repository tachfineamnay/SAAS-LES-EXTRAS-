import { cn } from "@/lib/utils";
import { ReactNode } from "react";

type BentoGridProps = {
    children: ReactNode;
    className?: string;
};

type BentoCardProps = {
    children: ReactNode;
    className?: string;
    colSpan?: number;
    rowSpan?: number;
    title?: string;
    description?: string;
    icon?: ReactNode;
    action?: ReactNode;
};

export function BentoGrid({ children, className }: BentoGridProps) {
    return (
        <div className={cn("grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[minmax(180px,auto)]", className)}>
            {children}
        </div>
    );
}

export function BentoCard({
    children,
    className,
    colSpan = 1,
    rowSpan = 1,
    title,
    description,
    icon,
    action
}: BentoCardProps) {
    return (
        <div
            className={cn(
                "group relative overflow-hidden rounded-xl border bg-card p-6 shadow-sm transition-all hover:shadow-md",
                colSpan === 2 && "md:col-span-2",
                colSpan === 3 && "md:col-span-3",
                rowSpan === 2 && "md:row-span-2",
                className
            )}
        >
            <div className="flex flex-col h-full">
                {(title || icon) && (
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                            {icon && (
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                    {icon}
                                </div>
                            )}
                            {title && (
                                <div>
                                    <h3 className="font-semibold text-lg tracking-tight text-card-foreground">
                                        {title}
                                    </h3>
                                    {description && (
                                        <p className="text-sm text-muted-foreground">{description}</p>
                                    )}
                                </div>
                            )}
                        </div>
                        {action && <div>{action}</div>}
                    </div>
                )}
                <div className="flex-1">{children}</div>
            </div>
        </div>
    );
}

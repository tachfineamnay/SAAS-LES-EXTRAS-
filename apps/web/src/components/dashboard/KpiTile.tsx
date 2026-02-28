import * as React from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { LucideIcon } from "lucide-react";

export interface KpiTileProps extends React.HTMLAttributes<HTMLDivElement> {
    label: string;
    value: string | number;
    icon: LucideIcon;
    trend?: "up" | "down" | "flat";
    trendLabel?: string;
    iconColor?: string;
}

export function KpiTile({
    label,
    value,
    icon: Icon,
    trend,
    trendLabel,
    iconColor = "text-primary",
    className,
    ...props
}: KpiTileProps) {
    const trendVariant =
        trend === "up"
            ? "success"
            : trend === "down"
                ? "error"
                : "quiet";

    return (
        <div
            className={cn(
                "rounded-lg border bg-card text-card-foreground shadow-sm",
                "transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md",
                "focus-within:ring-2 focus-within:ring-ring",
                "p-6",
                className
            )}
            {...props}
        >
            <div className="flex items-start justify-between mb-3">
                <p className="text-sm font-medium text-muted-foreground leading-tight">
                    {label}
                </p>
                <Icon className={cn("h-4 w-4 shrink-0", iconColor)} aria-hidden="true" />
            </div>

            <p className="text-2xl font-semibold tracking-tight text-foreground">
                {value}
            </p>

            {trend && trendLabel && (
                <div className="mt-2">
                    <Badge variant={trendVariant} className="text-xs">
                        {trend === "up" && "↑ "}
                        {trend === "down" && "↓ "}
                        {trendLabel}
                    </Badge>
                </div>
            )}
        </div>
    );
}

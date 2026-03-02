"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { LucideIcon } from "lucide-react";

export interface KpiTileProps extends Omit<
    React.HTMLAttributes<HTMLDivElement>, 
    'onDrag' | 'onDragStart' | 'onDragEnd' | 'onDragOver' | 'onDrop' | 
    'onAnimationStart' | 'onAnimationEnd' | 'onAnimationIteration' | 'onTransitionEnd'
> {
    label: string;
    value: string | number;
    icon: LucideIcon;
    trend?: "up" | "down" | "flat";
    trendLabel?: string;
    /** Icon container color — "teal" | "coral" | "sand" | "violet" | "emerald" | "amber" | "gray" */
    iconColor?: "teal" | "coral" | "sand" | "violet" | "emerald" | "amber" | "gray";
    /** Stagger entrance delay index */
    index?: number;
}

const iconContainerMap: Record<string, string> = {
    teal: "icon-teal",
    coral: "icon-coral",
    sand: "icon-sand",
    violet: "icon-violet",
    emerald: "icon-emerald",
    amber: "icon-amber",
    gray: "icon-gray",
};

export function KpiTile({
    label,
    value,
    icon: Icon,
    trend,
    trendLabel,
    iconColor = "teal",
    index = 0,
    className,
    ...props
}: KpiTileProps) {
    const trendVariant =
        trend === "up" ? "success" : trend === "down" ? "error" : "quiet";

    const iconClass = iconContainerMap[iconColor] ?? "icon-teal";

    return (
        <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
                duration: 0.4,
                delay: index * 0.07,
                ease: [0.22, 1, 0.36, 1],
            }}
            whileHover={{ y: -3, transition: { duration: 0.2 } }}
            className={cn(
                "bg-card card-shadow border border-border rounded-2xl",
                "focus-within:ring-2 focus-within:ring-ring",
                "p-6 cursor-default",
                className
            )}
            {...props}
        >
            <div className="flex items-start justify-between mb-4">
                <p className="text-sm font-medium text-muted-foreground leading-tight">
                    {label}
                </p>
                <motion.div
                    className={cn("flex h-9 w-9 items-center justify-center rounded-xl", iconClass)}
                    whileHover={{ scale: 1.1, rotate: 6 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                </motion.div>
            </div>

            <motion.p
                className="text-3xl font-bold tracking-tight text-foreground font-display"
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.35, delay: index * 0.07 + 0.12, ease: "easeOut" }}
            >
                {value}
            </motion.p>

            {trend && trendLabel && (
                <div className="mt-3">
                    <Badge variant={trendVariant} className="text-xs gap-1">
                        {trend === "up" ? "↑" : trend === "down" ? "↓" : "–"}
                        {" "}{trendLabel}
                    </Badge>
                </div>
            )}
        </motion.div>
    );
}

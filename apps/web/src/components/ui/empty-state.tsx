"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";
import Link from "next/link";

export interface EmptyStateAction {
    label: string;
    href?: string;
    onClick?: () => void;
}

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
    icon?: LucideIcon;
    title: string;
    description?: string;
    primaryAction?: EmptyStateAction;
    secondaryAction?: EmptyStateAction;
    tips?: string;
}

export function EmptyState({
    icon: Icon,
    title,
    description,
    primaryAction,
    secondaryAction,
    tips,
    className,
    ...props
}: EmptyStateProps) {
    return (
        <div
            className={cn(
                "flex flex-col items-center justify-center py-16 px-6 text-center max-w-md mx-auto",
                className
            )}
            {...props}
        >
            {Icon && (
                <div className="mb-4 rounded-full bg-muted p-4">
                    <Icon className="h-8 w-8 text-muted-foreground/50" aria-hidden="true" />
                </div>
            )}

            <h3 className="text-lg font-semibold text-foreground">{title}</h3>

            {description && (
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                    {description}
                </p>
            )}

            {(primaryAction || secondaryAction) && (
                <div className="mt-6 flex items-center gap-3">
                    {primaryAction && (
                        primaryAction.href ? (
                            <Button asChild>
                                <Link href={primaryAction.href}>{primaryAction.label}</Link>
                            </Button>
                        ) : (
                            <Button onClick={primaryAction.onClick}>
                                {primaryAction.label}
                            </Button>
                        )
                    )}

                    {secondaryAction && (
                        secondaryAction.href ? (
                            <Button variant="outline" asChild>
                                <Link href={secondaryAction.href}>
                                    {secondaryAction.label}
                                </Link>
                            </Button>
                        ) : (
                            <Button variant="outline" onClick={secondaryAction.onClick}>
                                {secondaryAction.label}
                            </Button>
                        )
                    )}
                </div>
            )}

            {tips && (
                <p className="mt-4 text-xs text-muted-foreground/70 italic">
                    💡 {tips}
                </p>
            )}
        </div>
    );
}

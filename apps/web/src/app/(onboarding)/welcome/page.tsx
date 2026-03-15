import Link from "next/link";
import { ArrowRight, CheckCircle2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlassCard, GlassCardContent } from "@/components/ui/glass-card";

export default function WelcomePage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-[hsl(var(--color-sand-50))] px-4">
            <GlassCard variant="muted" className="w-full max-w-lg">
                <GlassCardContent className="p-8 text-center space-y-6">
                    {/* Icon */}
                    <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-[hsl(var(--teal)/0.12)] border border-[hsl(var(--teal)/0.2)]">
                        <CheckCircle2 className="h-10 w-10 text-[hsl(var(--teal))]" />
                    </div>

                    {/* Heading */}
                    <div className="space-y-2">
                        <p className="text-xs font-semibold text-[hsl(var(--teal))] uppercase tracking-widest">
                            Compte créé avec succès
                        </p>
                        <h1 className="text-heading-xl">Bienvenue !</h1>
                        <p className="text-body-md text-[hsl(var(--text-secondary))]">
                            Votre compte a été créé avec succès.
                        </p>
                    </div>

                    {/* Body */}
                    <div className="space-y-3 text-body-sm text-[hsl(var(--text-secondary))] p-4 rounded-xl bg-[hsl(var(--surface-2))]">
                        <p>
                            Pour accéder à toutes les fonctionnalités de{" "}
                            <strong className="text-[hsl(var(--text-primary))]">Les Extras</strong>,
                            nous avons besoin de finaliser votre profil.
                        </p>
                        <p className="flex items-center justify-center gap-1.5">
                            <Sparkles className="h-4 w-4 text-[hsl(var(--coral))]" />
                            Cela ne prendra que <strong className="text-[hsl(var(--text-primary))]">2 minutes</strong>.
                        </p>
                    </div>

                    {/* CTA */}
                    <Button asChild size="lg" variant="coral" className="w-full text-base">
                        <Link href="/wizard">
                            Commencer <ArrowRight className="ml-2 h-5 w-5" />
                        </Link>
                    </Button>
                </GlassCardContent>
            </GlassCard>
        </div>
    );
}


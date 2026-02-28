"use client";

import { useState } from "react";
import Link from "next/link";
import { useFormState, useFormStatus } from "react-dom";
import { Briefcase, Building2, Loader2, ArrowRight, Mail, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { register, RegisterState } from "@/app/actions/auth";

const initialState: RegisterState = { message: "", errors: {} };

const ROLES = [
    {
        value: "TALENT" as const,
        label: "Je cherche des missions",
        sub: "Infirmier, Aide-soignant, Éducateur…",
        icon: Briefcase,
    },
    {
        value: "CLIENT" as const,
        label: "Je recrute des renforts",
        sub: "Établissement, Hôpital, EHPAD…",
        icon: Building2,
    },
];

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button className="w-full min-h-[44px] shadow-sm" type="submit" disabled={pending}>
            {pending ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
            )}
            {pending ? "Création du compte…" : "Créer mon compte"}
        </Button>
    );
}

export default function RegisterPage({ searchParams }: { searchParams: { role?: string } }) {
    const defaultRole = searchParams.role === "CLIENT" ? "CLIENT" : "TALENT";
    const [role, setRole] = useState<"CLIENT" | "TALENT">(defaultRole);
    const [state, formAction] = useFormState(register, initialState);

    return (
        <div className="flex min-h-screen bg-background">
            {/* Left brand panel */}
            <div className="relative hidden lg:flex lg:w-1/2 flex-col bg-foreground p-12 text-background overflow-hidden">
                <div
                    className="absolute inset-0 pointer-events-none auth-brand-halo-secondary"
                    aria-hidden="true"
                />
                <div className="relative z-10 flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center">
                        <span className="text-white font-bold text-sm">LE</span>
                    </div>
                    <span className="text-lg font-semibold">LesExtras</span>
                </div>
                <div className="relative z-10 mt-auto space-y-4">
                    <p className="text-3xl font-bold leading-tight">
                        Rejoignez la plateforme de référence du secteur social.
                    </p>
                    <p className="text-background/60 text-sm leading-relaxed">
                        Déjà plus de 500 professionnels et 120 établissements font confiance à LesExtras.
                    </p>
                    <div className="pt-4 border-t border-background/10">
                        <blockquote className="space-y-1">
                            <p className="text-sm text-background/80 italic">
                                "Grâce à LesExtras, j'ai trouvé des missions adaptées à mon emploi du temps en quelques clics."
                            </p>
                            <footer className="text-xs text-background/50">Sofia Davis, Infirmière</footer>
                        </blockquote>
                    </div>
                </div>
            </div>

            {/* Right form */}
            <div className="flex flex-1 items-center justify-center p-6 sm:p-10">
                <div className="w-full max-w-sm space-y-8">
                    <div className="lg:hidden flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-primary" aria-hidden="true" />
                        <span className="font-semibold">LesExtras</span>
                    </div>

                    <div className="space-y-1">
                        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Étape 1 sur 2</p>
                        <h1 className="text-2xl font-bold tracking-tight">Créer un compte</h1>
                        <p className="text-sm text-muted-foreground">Choisissez votre profil, puis entrez vos informations.</p>
                    </div>

                    {/* Role selector */}
                    <div className="grid gap-3" role="radiogroup" aria-label="Type de compte">
                        {ROLES.map((r) => {
                            const Icon = r.icon;
                            const isSelected = role === r.value;
                            return (
                                <button
                                    key={r.value}
                                    type="button"
                                    role="radio"
                                    aria-checked={isSelected ? "true" : "false"}
                                    onClick={() => setRole(r.value)}
                                    className={cn(
                                        "flex items-center gap-4 rounded-xl border-2 p-4 text-left transition-all duration-200",
                                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                                        isSelected
                                            ? "border-primary bg-primary/5"
                                            : "border-border hover:border-border/80 hover:bg-muted/40"
                                    )}
                                >
                                    <div
                                        className={cn(
                                            "flex h-10 w-10 items-center justify-center rounded-xl transition-colors",
                                            isSelected ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"
                                        )}
                                    >
                                        <Icon className="h-5 w-5" aria-hidden="true" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-sm">{r.label}</p>
                                        <p className="text-xs text-muted-foreground">{r.sub}</p>
                                    </div>
                                    {isSelected && (
                                        <div className="ml-auto h-2 w-2 rounded-full bg-primary" aria-hidden="true" />
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {state?.message && (
                        <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2.5" role="alert">
                            <p className="text-sm text-destructive">{state.message}</p>
                        </div>
                    )}

                    <form action={formAction} className="space-y-4" noValidate>
                        <input type="hidden" name="role" value={role} />

                        <div className="space-y-1.5">
                            <Label htmlFor="email">Email</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="votre@email.com"
                                    required
                                    className="pl-9"
                                    aria-invalid={!!state?.errors?.email}
                                    aria-describedby={state?.errors?.email ? "reg-email-error" : undefined}
                                />
                            </div>
                            {state?.errors?.email && (
                                <p id="reg-email-error" className="text-xs text-destructive" role="alert">
                                    {state.errors.email.join(", ")}
                                </p>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="password">Mot de passe</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
                                <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    placeholder="8 caractères minimum"
                                    required
                                    className="pl-9"
                                    aria-invalid={!!state?.errors?.password}
                                    aria-describedby={state?.errors?.password ? "reg-password-error" : undefined}
                                />
                            </div>
                            {state?.errors?.password && (
                                <p id="reg-password-error" className="text-xs text-destructive" role="alert">
                                    {state.errors.password.join(", ")}
                                </p>
                            )}
                        </div>

                        <SubmitButton />
                    </form>

                    <div className="space-y-3">
                        <p className="text-center text-sm text-muted-foreground">
                            Déjà un compte ?{" "}
                            <Link href="/login" className="text-primary hover:underline underline-offset-4 font-medium">
                                Se connecter
                            </Link>
                        </p>
                        <p className="text-center text-xs text-muted-foreground">
                            En créant un compte, vous acceptez nos{" "}
                            <Link href="/terms" className="underline underline-offset-4 hover:text-foreground">CGU</Link>
                            {" "}et notre{" "}
                            <Link href="/privacy" className="underline underline-offset-4 hover:text-foreground">politique de confidentialité</Link>.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

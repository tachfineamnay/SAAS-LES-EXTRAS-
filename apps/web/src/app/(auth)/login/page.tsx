"use client";

import { useFormState, useFormStatus } from "react-dom";
import Link from "next/link";
import { Loader2, Mail, Lock, ArrowRight, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { login } from "@/app/actions/login";

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button className="w-full min-h-[44px] shadow-sm" type="submit" disabled={pending}>
            {pending ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
            )}
            {pending ? "Connexion…" : "Se connecter"}
        </Button>
    );
}

export default function LoginPage() {
    const [state, action] = useFormState(login, undefined);

    return (
        <div className="flex min-h-screen bg-background">
            {/* Left — brand panel */}
            <div className="relative hidden lg:flex lg:w-1/2 flex-col bg-foreground p-12 text-background overflow-hidden">
                {/* Subtle halo */}
                <div
                    className="absolute inset-0 pointer-events-none auth-brand-halo-primary"
                    aria-hidden="true"
                />
                {/* Logo */}
                <div className="relative z-10 flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center">
                        <span className="text-white font-bold text-sm">LE</span>
                    </div>
                    <span className="text-lg font-semibold">LesExtras</span>
                </div>

                {/* Tagline */}
                <div className="relative z-10 mt-auto space-y-4">
                    <p className="text-3xl font-bold leading-tight">
                        La plateforme pour les pros du secteur social & médico-social.
                    </p>
                    <p className="text-background/60 text-sm leading-relaxed">
                        Connectez les établissements avec les meilleurs freelances. Simple, rapide, sécurisé.
                    </p>
                    <div className="pt-4 border-t border-background/10">
                        <blockquote className="space-y-1">
                            <p className="text-sm text-background/80 italic">
                                "Simple, efficace et transparent. Exactement ce qu'il nous fallait."
                            </p>
                            <footer className="text-xs text-background/50">Jean Dupont, Directeur d'Établissement</footer>
                        </blockquote>
                    </div>
                </div>
            </div>

            {/* Right — form */}
            <div className="flex flex-1 items-center justify-center p-6 sm:p-10">
                <div className="w-full max-w-sm space-y-8">
                    {/* Mobile logo */}
                    <div className="flex items-center gap-2 lg:hidden">
                        <div className="h-8 w-8 rounded-lg bg-primary" aria-hidden="true" />
                        <span className="font-semibold">LesExtras</span>
                    </div>

                    <div className="space-y-1">
                        <h1 className="text-2xl font-bold tracking-tight">Bon retour !</h1>
                        <p className="text-sm text-muted-foreground">Entrez vos identifiants pour accéder à votre espace.</p>
                    </div>

                    <form action={action} className="space-y-4" noValidate>
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
                                    defaultValue="directeur@mecs-avenir.fr"
                                    className="pl-9"
                                    aria-invalid={!!state?.errors?.email}
                                    aria-describedby={state?.errors?.email ? "email-error" : undefined}
                                />
                            </div>
                            {state?.errors?.email && (
                                <p id="email-error" className="text-xs text-destructive flex items-center gap-1" role="alert">
                                    {state.errors.email}
                                </p>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password">Mot de passe</Label>
                                <Link href="/auth/forgot-password" className="text-xs text-primary hover:underline underline-offset-4">
                                    Oublié ?
                                </Link>
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
                                <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    defaultValue="password123"
                                    className="pl-9"
                                    aria-invalid={!!state?.errors?.password}
                                    aria-describedby={state?.errors?.password ? "password-error" : undefined}
                                />
                            </div>
                            {state?.errors?.password && (
                                <p id="password-error" className="text-xs text-destructive flex items-center gap-1" role="alert">
                                    {state.errors.password}
                                </p>
                            )}
                        </div>

                        {state?.message && (
                            <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2.5" role="alert">
                                <p className="text-sm text-destructive">{state.message}</p>
                            </div>
                        )}

                        <SubmitButton />
                    </form>

                    <p className="text-center text-sm text-muted-foreground">
                        Pas encore de compte ?{" "}
                        <Link href="/register" className="text-primary hover:underline underline-offset-4 font-medium">
                            S'inscrire
                        </Link>
                    </p>

                    {/* Demo zone */}
                    <div className="rounded-xl bg-muted/50 border border-border/60 p-4 space-y-2">
                        <div className="flex items-center gap-1.5">
                            <Users className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Comptes démo</p>
                        </div>
                        <div className="space-y-1 text-xs text-muted-foreground">
                            <p><span className="text-foreground font-medium">Établissement :</span> directeur@mecs-avenir.fr</p>
                            <p><span className="text-foreground font-medium">Freelance :</span> karim.educ@gmail.com</p>
                            <p><span className="text-foreground font-medium">Mot de passe :</span> password123</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { UserRole } from "@prisma/client";
import { Briefcase, Building2, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

// This would typically come from an auth action
// import { register } from "@/app/actions/auth";

export default function RegisterPage({ searchParams }: { searchParams: { role?: string } }) {
    const defaultRole = searchParams.role === "CLIENT" ? "CLIENT" : "TALENT";
    const [role, setRole] = useState<"CLIENT" | "TALENT">(defaultRole);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);

        // Simulate registration delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        // In a real app, we would call the server action here
        // const formData = new FormData(e.currentTarget);
        // await register(formData);

        setIsLoading(false);
        // Redirect handled by action
    };

    return (
        <div className="container relative flex h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
            <div className="relative hidden h-full flex-col bg-muted p-10 text-white dark:border-r lg:flex">
                <div className="absolute inset-0 bg-zinc-900" />
                <div className="relative z-20 flex items-center text-lg font-medium">
                    <div className="h-8 w-8 rounded-lg bg-primary mr-2" />
                    Les Extras
                </div>
                <div className="relative z-20 mt-auto">
                    <blockquote className="space-y-2">
                        <p className="text-lg">
                            "Grâce à Les Extras, j'ai pu trouver des missions adaptées à mon emploi du temps en quelques clics. Une transparence totale."
                        </p>
                        <footer className="text-sm">Sofia Davis, Infirmière</footer>
                    </blockquote>
                </div>
            </div>
            <div className="lg:p-8">
                <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
                    <div className="flex flex-col space-y-2 text-center">
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Créer un compte
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Entrez votre email ci-dessous pour créer votre compte
                        </p>
                    </div>

                    <Tabs defaultValue={defaultRole} onValueChange={(v) => setRole(v as any)} className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="TALENT">Talent</TabsTrigger>
                            <TabsTrigger value="CLIENT">Client</TabsTrigger>
                        </TabsList>

                        <div className="mt-4 grid gap-4">
                            <div
                                className={cn(
                                    "cursor-pointer rounded-xl border-2 p-4 hover:border-primary transition-all",
                                    role === "TALENT" ? "border-primary bg-primary/5" : "border-muted"
                                )}
                                onClick={() => setRole("TALENT")}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                        <Briefcase className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <div className="font-semibold">Je cherche des missions</div>
                                        <div className="text-xs text-muted-foreground">Infirmier, Aide-soignant...</div>
                                    </div>
                                </div>
                            </div>

                            <div
                                className={cn(
                                    "cursor-pointer rounded-xl border-2 p-4 hover:border-primary transition-all",
                                    role === "CLIENT" ? "border-primary bg-primary/5" : "border-muted"
                                )}
                                onClick={() => setRole("CLIENT")}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent">
                                        <Building2 className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <div className="font-semibold">Je recrute</div>
                                        <div className="text-xs text-muted-foreground">Etablissement, Hôpital...</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
                            <input type="hidden" name="role" value={role} />
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" name="email" type="email" placeholder="m@example.com" required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">Mot de passe</Label>
                                <Input id="password" name="password" type="password" required />
                            </div>
                            <Button className="w-full" type="submit" disabled={isLoading}>
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Continuer
                            </Button>
                        </form>
                    </Tabs>

                    <p className="px-8 text-center text-sm text-muted-foreground">
                        En cliquant sur continuer, vous acceptez nos{" "}
                        <Link href="/terms" className="underline underline-offset-4 hover:text-primary">
                            Conditions d'utilisation
                        </Link>{" "}
                        et notre{" "}
                        <Link href="/privacy" className="underline underline-offset-4 hover:text-primary">
                            Politique de confidentialité
                        </Link>
                        .
                    </p>
                </div>
            </div>
        </div>
    );
}

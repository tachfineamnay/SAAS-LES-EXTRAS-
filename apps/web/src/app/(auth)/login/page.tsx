"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
// import { login } from "@/app/actions/auth"; // Hypothetical action

export default function LoginPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);

        // Simulate login delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        // In a real app: await login(formData);

        setIsLoading(false);
        router.push("/dashboard");
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
                            "Simple, efficace et transparent. Exactement ce qu'il nous fallait."
                        </p>
                        <footer className="text-sm">Jean Dupont, Directeur d'Etablissement</footer>
                    </blockquote>
                </div>
            </div>
            <div className="lg:p-8">
                <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
                    <div className="flex flex-col space-y-2 text-center">
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Bon retour !
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Entrez vos identifiants pour vous connecter
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" name="email" type="email" placeholder="m@example.com" required />
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password">Mot de passe</Label>
                                <Link href="/auth/forgot-password" className="text-sm text-primary hover:underline">
                                    Oublié ?
                                </Link>
                            </div>
                            <Input id="password" name="password" type="password" required />
                        </div>
                        <Button className="w-full" type="submit" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Se connecter
                        </Button>
                    </form>

                    <p className="px-8 text-center text-sm text-muted-foreground">
                        Pas encore de compte ?{" "}
                        <Link href="/register" className="underline underline-offset-4 hover:text-primary">
                            S'inscrire
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

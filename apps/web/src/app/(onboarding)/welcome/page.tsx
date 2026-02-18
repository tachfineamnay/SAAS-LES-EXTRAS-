"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function WelcomePage() {
    return (
        <div className="container flex h-screen items-center justify-center">
            <Card className="w-full max-w-lg border-2 border-primary/10 bg-card shadow-xl">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                        <CheckCircle2 className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle className="text-3xl font-bold">Bienvenue !</CardTitle>
                    <CardDescription className="text-lg">
                        Votre compte a été créé avec succès.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 text-center text-muted-foreground">
                    <p>
                        Pour accéder à toutes les fonctionnalités de <strong>Les Extras</strong>,
                        nous avons besoin de finaliser votre profil.
                    </p>
                    <p>
                        Cela ne prendra que <strong>2 minutes</strong>.
                    </p>
                </CardContent>
                <CardFooter>
                    <Button asChild size="lg" className="w-full text-lg">
                        <Link href="/wizard">
                            Commencer <ArrowRight className="ml-2 h-5 w-5" />
                        </Link>
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}

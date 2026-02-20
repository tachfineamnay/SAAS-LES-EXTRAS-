"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Coins, Plus } from "lucide-react";
import { useTransition } from "react";
import { buyPack } from "@/actions/credits";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Check } from "lucide-react";
import { useState } from "react";

interface CreditsWidgetProps {
    credits: number;
}

const PACKS = [
    {
        id: "STARTER",
        name: "Starter",
        credits: 1,
        price: 150,
        features: ["1 mise en relation", "Support standard", "Validité illimitée"],
        popular: false
    },
    {
        id: "PRO",
        name: "Pro",
        credits: 3,
        price: 400,
        features: ["3 mises en relation", "Économie de 50€", "Support prioritaire", "Badge 'Recruteur'"],
        popular: true
    },
    {
        id: "ENTERPRISE",
        name: "Entreprise",
        credits: 5,
        price: 600,
        features: ["5 mises en relation", "Économie de 150€", "Account Manager dédié", "Badge 'Partenaire'"],
        popular: false
    }
] as const;

export function CreditsWidget({ credits }: CreditsWidgetProps) {
    const [open, setOpen] = useState(false);
    const [isPending, startTransition] = useTransition();

    const handleBuyPack = (packId: string, packName: string, price: number) => {
        if (confirm(`Confirmer l'achat du pack '${packName}' pour ${price}€ ?`)) {
            startTransition(async () => {
                // @ts-ignore
                const result = await buyPack(packId);
                if ('error' in result) {
                    toast.error(result.error);
                } else {
                    toast.success(`Pack ${packName} acheté avec succès !`);
                    setOpen(false);
                }
            });
        }
    };

    return (
        <div className="space-y-4">
            <Card className={credits === 0 ? "border-red-500" : ""}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Crédits Recrutement
                    </CardTitle>
                    <Coins className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{credits}</div>
                    <p className="text-xs text-muted-foreground">
                        Mises en relation disponibles
                    </p>

                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                            <Button className="w-full mt-4" size="sm">
                                <Plus className="mr-2 h-4 w-4" /> Acheter des crédits
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[800px]">
                            <DialogHeader>
                                <DialogTitle>Choisir un pack de crédits</DialogTitle>
                                <DialogDescription>
                                    Achetez des crédits pour valider vos renforts. Plus vous en prenez, plus vous économisez.
                                </DialogDescription>
                            </DialogHeader>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4">
                                {PACKS.map((pack) => (
                                    <div
                                        key={pack.id}
                                        className={`relative flex flex-col border rounded-lg p-4 hover:shadow-lg transition-shadow ${pack.popular ? 'border-primary shadow-md bg-primary/5' : 'border-border'}`}
                                    >
                                        {pack.popular && (
                                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">
                                                Populaire
                                            </div>
                                        )}
                                        <div className="mb-4">
                                            <h3 className="font-bold text-lg">{pack.name}</h3>
                                            <div className="flex items-baseline mt-2">
                                                <span className="text-2xl font-bold">{pack.price}€</span>
                                                <span className="text-sm text-muted-foreground ml-1">HT</span>
                                            </div>
                                            <p className="text-sm font-medium mt-1 text-primary">
                                                {pack.credits} crédit{pack.credits > 1 ? 's' : ''}
                                            </p>
                                        </div>

                                        <ul className="space-y-2 mb-6 flex-1">
                                            {pack.features.map((feature, i) => (
                                                <li key={i} className="text-xs flex items-center text-muted-foreground">
                                                    <Check className="h-3 w-3 mr-2 text-green-500" />
                                                    {feature}
                                                </li>
                                            ))}
                                        </ul>

                                        <Button
                                            className={`w-full ${pack.popular ? '' : 'variant-outline'}`}
                                            onClick={() => handleBuyPack(pack.id, pack.name, pack.price)}
                                            disabled={isPending}
                                            variant={pack.popular ? "default" : "outline"}
                                        >
                                            {isPending ? "..." : "Choisir"}
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </DialogContent>
                    </Dialog>
                </CardContent>
            </Card>

            {credits === 0 && (
                <Alert variant="destructive">
                    <Coins className="h-4 w-4" />
                    <AlertTitle>Solde épuisé</AlertTitle>
                    <AlertDescription>
                        Vous n'avez plus de droits de mise en relation. Achetez un pack pour valider vos prochains renforts.
                    </AlertDescription>
                </Alert>
            )}
        </div>
    );
}

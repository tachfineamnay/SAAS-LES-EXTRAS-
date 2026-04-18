"use client";

import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Coins, Plus } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { buyPack, type PackType } from "@/actions/credits";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";
import { AnimatedNumber } from "@/components/ui/animated-number";
import { CREDIT_PACKS } from "@/lib/credit-packs";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Check } from "lucide-react";

interface CreditsWidgetProps {
    credits: number | null;
    error?: string | null;
}

export function CreditsWidget({ credits, error = null }: CreditsWidgetProps) {
    const [open, setOpen] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [displayCredits, setDisplayCredits] = useState(credits);

    useEffect(() => {
        setDisplayCredits(credits);
    }, [credits]);

    const handleBuyPack = (packId: PackType, packName: string, price: number) => {
        if (confirm(`Confirmer l'ajout du pack '${packName}' pour ${price}€ ?`)) {
            startTransition(async () => {
                const result = await buyPack(packId);
                if ("error" in result) {
                    toast.error(result.error);
                } else {
                    setDisplayCredits(result.availableCredits);
                    toast.success(`Pack ${packName} ajouté au solde avec succès !`);
                    setOpen(false);
                }
            });
        }
    };

    return (
        <div className="space-y-4">
            <GlassCard variant={displayCredits === 0 ? "glass" : "interactive"} className={displayCredits === 0 ? "border-[hsl(var(--destructive)/0.6)]" : ""}>
                <div className="p-6">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Crédits</span>
                        <Coins className="h-4 w-4 text-muted-foreground" />
                    </div>
                    {typeof displayCredits === "number" ? (
                        <AnimatedNumber value={displayCredits} className="text-2xl font-bold" />
                    ) : (
                        <div className="text-2xl font-bold">—</div>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                        Solde disponible pour vos validations de réservation
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
                                    Ajoutez des crédits à votre solde. Un crédit est consommé lorsqu&apos;une réservation est validée.
                                </DialogDescription>
                            </DialogHeader>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4">
                                {CREDIT_PACKS.map((pack) => (
                                    <div
                                        key={pack.id}
                                        className={`relative flex flex-col rounded-2xl p-4 transition-all duration-200 ${pack.popular ? 'bg-card border border-[hsl(var(--teal)/0.3)] card-shadow-md' : 'bg-card border border-border hover:card-shadow-md'}`}
                                    >
                                        {pack.popular && (
                                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full shadow-[0_0_12px_hsl(var(--teal)/0.3)]">
                                                Populaire
                                            </div>
                                        )}
                                        <div className="mb-4">
                                            <h3 className="font-bold text-lg">{pack.name}</h3>
                                            <div className="flex items-baseline mt-2">
                                                <span className="text-2xl font-bold">{pack.price}€</span>
                                            </div>
                                            <p className="text-sm font-medium mt-1 text-primary">
                                                {pack.credits} crédit{pack.credits > 1 ? 's' : ''}
                                            </p>
                                        </div>

                                        <ul className="space-y-2 mb-6 flex-1">
                                            {pack.features.map((feature, i) => (
                                                <li key={i} className="text-xs flex items-center text-muted-foreground">
                                                    <Check className="h-3 w-3 mr-2 text-[hsl(var(--emerald))]" />
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
                </div>
            </GlassCard>

            {error && (
                <Alert variant="destructive">
                    <Coins className="h-4 w-4" />
                    <AlertTitle>Solde indisponible</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {!error && displayCredits === 0 && (
                <Alert variant="destructive">
                    <Coins className="h-4 w-4" />
                    <AlertTitle>Solde épuisé</AlertTitle>
                    <AlertDescription>
                        Votre solde de crédits est à zéro. Ajoutez un pack pour préparer vos prochains recrutements.
                    </AlertDescription>
                </Alert>
            )}
        </div>
    );
}

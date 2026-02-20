"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Coins, Plus } from "lucide-react";
import { useTransition } from "react";
import { buyPack } from "@/actions/credits";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";

interface CreditsWidgetProps {
    credits: number;
}

export function CreditsWidget({ credits }: CreditsWidgetProps) {
    const [isPending, startTransition] = useTransition();

    const handleBuyPack = () => {
        // For MVP demo, we assume buying a Starter pack
        if (confirm("Confirmer l'achat du pack 'Starter' (1 recrutement) pour 150€ ?")) {
            startTransition(async () => {
                const result = await buyPack("STARTER");
                if ('error' in result) {
                    toast.error(result.error);
                } else {
                    toast.success("Pack acheté avec succès ! Crédit ajouté.");
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

                    <Button
                        className="w-full mt-4"
                        size="sm"
                        onClick={handleBuyPack}
                        disabled={isPending}
                    >
                        {isPending ? "Achat en cours..." : (
                            <>
                                <Plus className="mr-2 h-4 w-4" /> Acheter un Pack
                            </>
                        )}
                    </Button>
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

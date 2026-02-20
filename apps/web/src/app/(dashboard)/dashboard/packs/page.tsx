"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { buyPack } from "@/actions/credits";
import { Button } from "@/components/ui/button";
import { Check, Star } from "lucide-react";

const PACKS = [
    {
        id: "STARTER",
        name: "Starter",
        credits: 1,
        price: 150,
        features: [
            "1 mise en relation",
            "Support standard",
            "Validité illimitée",
            "Facturation automatique"
        ],
        popular: false,
        color: "bg-blue-500",
        description: "Idéal pour un besoin ponctuel."
    },
    {
        id: "PRO",
        name: "Pro",
        credits: 3,
        price: 400,
        features: [
            "3 mises en relation",
            "Économie de 50€",
            "Support prioritaire",
            "Badge 'Recruteur'",
            "Accès aux profils vérifiés"
        ],
        popular: true,
        color: "bg-purple-500",
        description: "Le choix préféré des directeurs."
    },
    {
        id: "ENTERPRISE",
        name: "Entreprise",
        credits: 5,
        price: 600,
        features: [
            "5 mises en relation",
            "Économie de 150€",
            "Account Manager dédié",
            "Badge 'Partenaire'",
            "Priorité sur le support",
            "Reporting mensuel"
        ],
        popular: false,
        color: "bg-indigo-500",
        description: "Pour les besoins réguliers."
    }
] as const;

export default function PacksPage() {
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
                }
            });
        }
    };

    return (
        <div className="space-y-8 p-8 max-w-7xl mx-auto">
            <div className="text-center space-y-4">
                <h1 className="text-4xl font-bold tracking-tight">Choisissez votre Pack de Crédits</h1>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                    Simplifiez vos recrutements avec nos formules prépayées.
                    Plus vous achetez, plus vous économisez sur vos mises en relation.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8">
                {PACKS.map((pack) => (
                    <div
                        key={pack.id}
                        className={`relative flex flex-col rounded-2xl border bg-card p-8 shadow-sm transition-all hover:shadow-xl ${pack.popular ? 'border-primary ring-2 ring-primary ring-opacity-50 scale-105 z-10' : 'hover:border-primary/50'
                            }`}
                    >
                        {pack.popular && (
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-sm font-bold px-4 py-1.5 rounded-full shadow-lg flex items-center gap-1">
                                <Star className="h-4 w-4 fill-current" />
                                Plus Populaire
                            </div>
                        )}

                        <div className="mb-6 space-y-2">
                            <h3 className="text-2xl font-bold">{pack.name}</h3>
                            <p className="text-sm text-muted-foreground">{pack.description}</p>
                        </div>

                        <div className="mb-6 pb-6 border-b border-border/50">
                            <div className="flex items-baseline">
                                <span className="text-5xl font-extrabold">{pack.price}€</span>
                                <span className="text-muted-foreground ml-2 font-medium">HT</span>
                            </div>
                            <p className="text-sm font-medium mt-2 text-primary">
                                Soit {Math.round(pack.price / pack.credits)}€ / recrutement
                            </p>
                        </div>

                        <ul className="space-y-4 mb-8 flex-1">
                            {pack.features.map((feature, i) => (
                                <li key={i} className="flex items-start text-sm text-muted-foreground">
                                    <div className={`mr-3 h-5 w-5 rounded-full flex items-center justify-center shrink-0 ${pack.popular ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                                        <Check className="h-3 w-3" />
                                    </div>
                                    <span>{feature}</span>
                                </li>
                            ))}
                        </ul>

                        <Button
                            className={`w-full h-12 text-lg font-semibold ${pack.popular ? 'shadow-lg shadow-primary/20' : ''}`}
                            onClick={() => handleBuyPack(pack.id, pack.name, pack.price)}
                            disabled={isPending}
                            variant={pack.popular ? "default" : "outline"}
                        >
                            {isPending ? "Traitement..." : "Choisir ce pack"}
                        </Button>

                        <p className="text-xs text-center text-muted-foreground mt-4">
                            Paiement sécurisé • Facture immédiate
                        </p>
                    </div>
                ))}
            </div>

            <div className="mt-16 bg-muted/30 rounded-xl p-8 max-w-4xl mx-auto">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary text-xs">?</span>
                    Questions Fréquentes
                </h3>
                <div className="grid md:grid-cols-2 gap-6 text-sm text-muted-foreground">
                    <div>
                        <strong className="text-foreground block mb-1">Comment fonctionnent les crédits ?</strong>
                        1 crédit = 1 mise en relation validée. Vous ne payez que lorsque vous confirmez un recrutement.
                    </div>
                    <div>
                        <strong className="text-foreground block mb-1">Les crédits ont-ils une date d'expiration ?</strong>
                        Non, vos crédits sont valables sans limite de temps tant que votre compte est actif.
                    </div>
                    <div>
                        <strong className="text-foreground block mb-1">Puis-je obtenir un remboursement ?</strong>
                        Les packs ne sont pas remboursables, mais nous garantissons la qualité des profils.
                    </div>
                    <div>
                        <strong className="text-foreground block mb-1">Besoin de plus de 5 crédits ?</strong>
                        Contactez notre service commercial pour des offres sur mesure pour grands groupes.
                    </div>
                </div>
            </div>
        </div>
    );
}

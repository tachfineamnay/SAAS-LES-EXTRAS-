
import { notFound } from "next/navigation";
import { getService } from "@/app/actions/marketplace";
import { BookingModal } from "@/components/marketplace/BookingModal";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, MapPin, Clock3, Users, Euro, ShieldCheck } from "lucide-react";
import Image from "next/image";

type PageProps = {
    params: {
        id: string;
    };
};

function getAvatarFallback(name: string): string {
    return name
        .split(" ")
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() ?? "")
        .join("");
}

export default async function ServiceDetailPage({ params }: PageProps) {
    const service = await getService(params.id);

    if (!service) {
        notFound();
    }

    const ownerName = service.owner?.profile
        ? `${service.owner.profile.firstName} ${service.owner.profile.lastName}`
        : "Freelance";

    const ownerJob = service.owner?.profile?.jobTitle || "Expert";
    const ownerBio = service.owner?.profile?.bio || "Aucune biographie disponible.";

    return (
        <div className="container max-w-6xl py-8 space-y-8">
            {/* Breadcrumb / Back link */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <a href="/marketplace" className="hover:text-foreground">Marketplace</a>
                <span>/</span>
                <span className="text-foreground">{service.title}</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* LEFT COLUMN: MAIN CONTENT */}
                <div className="lg:col-span-2 space-y-8">

                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <Badge variant="outline" className="text-primary border-primary">
                                {service.type === "WORKSHOP" ? "ATELIER" : "FORMATION"}
                            </Badge>
                            <span className="text-sm text-muted-foreground flex items-center gap-1">
                                <Clock3 className="h-4 w-4" /> {service.type === "WORKSHOP" ? "2h" : "4h"}
                            </span>
                        </div>

                        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
                            {service.title}
                        </h1>

                        {/* Owner Mini-Profile */}
                        <div className="flex items-center gap-3 pt-2">
                            <Avatar className="h-12 w-12 border-2 border-background shadow-sm">
                                <AvatarFallback className="bg-primary/10 text-primary font-bold">
                                    {getAvatarFallback(ownerName)}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="text-sm text-muted-foreground">Proposé par</p>
                                <p className="font-medium text-foreground">{ownerName}</p>
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* Description */}
                    <div className="prose prose-slate max-w-none dark:prose-invert">
                        <h3 className="text-xl font-bold text-foreground mb-4">À propos de ce service</h3>
                        <p className="whitespace-pre-wrap leading-relaxed">
                            {service.description || "Le freelance n'a pas fourni de description détaillée pour ce service."}
                        </p>
                    </div>

                    <Separator />

                    {/* Instructor Bio */}
                    <div className="bg-muted/30 p-6 rounded-xl border">
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <ShieldCheck className="h-5 w-5 text-primary" />
                            L'Intervenant
                        </h3>
                        <div className="flex flex-col md:flex-row gap-6">
                            <div className="flex-shrink-0">
                                <Avatar className="h-20 w-20">
                                    <AvatarFallback className="text-xl">{getAvatarFallback(ownerName)}</AvatarFallback>
                                </Avatar>
                            </div>
                            <div className="space-y-2">
                                <div>
                                    <h4 className="font-semibold text-lg">{ownerName}</h4>
                                    <p className="text-sm text-primary font-medium">{ownerJob}</p>
                                </div>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    {ownerBio}
                                </p>
                            </div>
                        </div>
                    </div>

                </div>

                {/* RIGHT COLUMN: STICKY BUY BOX */}
                <div className="relative">
                    <div className="sticky top-24">
                        <Card className="border-2 border-primary/20 shadow-lg overflow-hidden">
                            <div className="bg-primary/5 p-4 border-b border-primary/10">
                                <h3 className="font-semibold text-primary text-center">Récapitulatif</h3>
                            </div>
                            <CardContent className="p-6 space-y-6">

                                <div className="flex items-end justify-between">
                                    <span className="text-muted-foreground font-medium">Prix total</span>
                                    <div className="text-right">
                                        <span className="text-3xl font-bold text-foreground">{service.price} €</span>
                                        <span className="text-xs text-muted-foreground block font-medium">Hors Taxes</span>
                                    </div>
                                </div>

                                <div className="space-y-3 pt-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="flex items-center gap-2 text-muted-foreground">
                                            <Users className="h-4 w-4" /> Capacité
                                        </span>
                                        <span className="font-medium">{service.capacity} personnes</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="flex items-center gap-2 text-muted-foreground">
                                            <MapPin className="h-4 w-4" /> Lieu
                                        </span>
                                        <span className="font-medium">Sur site</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="flex items-center gap-2 text-muted-foreground">
                                            <CheckCircle2 className="h-4 w-4" /> Matériel
                                        </span>
                                        <span className="font-medium text-green-600">Inclus</span>
                                    </div>
                                </div>

                                <Separator />

                                <div className="space-y-3">
                                    <BookingModal
                                        serviceId={service.id}
                                        serviceTitle={service.title}
                                        trigger={
                                            <Button size="lg" className="w-full text-md h-12 shadow-md hover:shadow-lg transition-all">
                                                Demander une réservation
                                            </Button>
                                        }
                                    />
                                    <p className="text-xs text-center text-muted-foreground px-4">
                                        Vous ne serez débité qu'une fois la mission validée par le freelance.
                                    </p>
                                </div>

                            </CardContent>
                        </Card>

                        {/* Trust signals */}
                        <div className="mt-6 space-y-3 px-4">
                            <div className="flex items-start gap-3">
                                <ShieldCheck className="h-5 w-5 text-green-600 mt-0.5" />
                                <div className="text-sm">
                                    <p className="font-medium">Profil Vérifié</p>
                                    <p className="text-muted-foreground text-xs">L'identité et les diplômes de ce freelance ont été contrôlés.</p>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

            </div>
        </div>
    );
}

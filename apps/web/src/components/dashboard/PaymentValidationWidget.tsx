"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { authorizePayment } from "@/actions/payments";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2, CreditCard } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Booking {
    id: string;
    status: string;
    reliefMission?: {
        title: string;
    };
    service?: {
        title: string;
    };
    talent?: {
        email: string;
    };
    // We might need price/amount here to display? 
    // currently listing logic in BookingsService returns lines, maybe we can reuse.
}

export function PaymentValidationWidget({ bookings }: { bookings: any[] }) {
    const router = useRouter();
    const [loadingId, setLoadingId] = useState<string | null>(null);

    if (!bookings || bookings.length === 0) {
        return <div className="text-sm text-muted-foreground">Aucun paiement en attente.</div>;
    }

    async function handlePayment(id: string) {
        setLoadingId(id);
        const result = await authorizePayment(id);

        if (result.error) {
            toast.error(result.error);
            setLoadingId(null);
        } else {
            toast.success("Paiement validé avec succès !");
            setLoadingId(null);
            router.refresh();
        }
    }

    return (
        <div className="space-y-4">
            {bookings.map((booking) => (
                <Card key={booking.lineId || booking.id} className="border-l-4 border-l-green-500">
                    <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                            <CardTitle className="text-base font-semibold">
                                {booking.typeLabel}
                            </CardTitle>
                            <Badge variant="outline">À Valider</Badge>
                        </div>
                        <CardDescription className="text-xs">
                            {new Date(booking.date).toLocaleDateString()} - {booking.interlocutor}
                        </CardDescription>
                    </CardHeader>
                    <CardFooter className="pt-0 flex justify-end">
                        <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => handlePayment(booking.relatedBookingId || booking.id)}
                            disabled={loadingId === (booking.relatedBookingId || booking.id)}
                        >
                            {loadingId === (booking.relatedBookingId || booking.id) ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4 mr-1" />}
                            Valider le paiement
                        </Button>
                    </CardFooter>
                </Card>
            ))}
        </div>
    );
}

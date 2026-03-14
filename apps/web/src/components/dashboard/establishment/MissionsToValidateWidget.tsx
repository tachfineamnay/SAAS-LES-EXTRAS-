"use client";

import { BookingLine, completeBookingLine } from "@/app/actions/bookings";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle, Clock, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface MissionsToValidateWidgetProps {
    bookings: BookingLine[];
}

export function MissionsToValidateWidget({ bookings }: MissionsToValidateWidgetProps) {
    const [loadingId, setLoadingId] = useState<string | null>(null);

    const handleValidate = async (bookingId: string) => {
        setLoadingId(bookingId);
        try {
            // In the real implementation, we would call the action
            // For now we assume completeBookingLine points to /bookings/complete
            // which we updated backend to handle invoice generation.
            const result = await completeBookingLine({ bookingId });
            if (result.ok) {
                toast.success("Mission validée ! La facture a été générée.");
            }
        } catch (error) {
            toast.error("Erreur lors de la validation : " + (error as any).message);
        } finally {
            setLoadingId(null);
        }
    };

    if (bookings.length === 0) return null;

    return (
        <div className="space-y-4">
            {bookings.map((booking) => (
                <div
                    key={booking.lineId}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-lg border border-amber-200 bg-amber-50/50 gap-4"
                >
                    <div className="flex items-start gap-3">
                        <div className="mt-1 bg-amber-100 p-2 rounded-full hidden sm:block">
                            <Clock className="h-5 w-5 text-amber-600" />
                        </div>
                        <div>
                            <h4 className="font-semibold text-amber-900">
                                Mission terminée à valider
                            </h4>
                            <p className="text-sm text-amber-800">
                                {booking.typeLabel} avec {booking.interlocutor} - {booking.date}
                            </p>
                            <p className="text-xs text-amber-600 mt-1">
                                Confirmez les heures pour générer la facture.
                            </p>
                        </div>
                    </div>
                    <Button
                        className="w-full sm:w-auto bg-amber-600 hover:bg-amber-700 text-white border-none"
                        onClick={() => handleValidate(booking.lineId)}
                        disabled={loadingId === booking.lineId}
                    >
                        {loadingId === booking.lineId ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <CheckCircle className="mr-2 h-4 w-4" />
                        )}
                        Valider les heures
                    </Button>
                </div>
            ))}
        </div>
    );
}

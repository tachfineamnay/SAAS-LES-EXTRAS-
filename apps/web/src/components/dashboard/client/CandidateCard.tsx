
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { acceptCandidate } from "@/app/actions/missions";
import { toast } from "sonner";
import { useState } from "react";
import { Check, Loader2, User } from "lucide-react";
import Link from "next/link"; // If we want to link to profile

interface CandidateCardProps {
    bookingId: string;
    talent: {
        id: string; // Wait, booking.talentId
        email: string;
        // profile: ... we need profile data here?
        // The booking object structure from getBookingsPageData or similar needs to be checked.
        // Assuming we pass basic info or full profile if available.
        // Let's assume we receive name/avatar relevant info.
    } | any;
    status: string;
}

export function CandidateCard({ bookingId, talent, status }: CandidateCardProps) {
    const [isPending, setIsPending] = useState(false);

    // Mock Name if not available deeply
    // Ideally we fetch profile in the page query.
    const name = talent?.email || "Candidat";

    const handleAccept = async () => {
        setIsPending(true);
        const result = await acceptCandidate(bookingId);
        setIsPending(false);

        if (result.ok) {
            toast.success("Candidat accepté !", {
                description: "La mission a été assignée."
            });
        } else {
            toast.error("Erreur", {
                description: result.error || "Impossible d'accepter ce candidat."
            });
        }
    };

    return (
        <Card className="flex flex-col overflow-hidden">
            <CardHeader className="p-4 flex flex-row items-center gap-4 space-y-0">
                <Avatar className="h-10 w-10">
                    <AvatarFallback><User className="h-6 w-6" /></AvatarFallback>
                </Avatar>
                <div>
                    <h4 className="font-semibold text-sm">{name}</h4>
                    <p className="text-xs text-muted-foreground">Candidature reçue</p>
                </div>
            </CardHeader>
            <CardFooter className="p-4 pt-0 bg-muted/20 mt-auto border-t flex gap-2">
                <Button
                    size="sm"
                    className="w-full bg-green-600 hover:bg-green-700 text-white gap-2"
                    onClick={handleAccept}
                    disabled={isPending || status !== 'PENDING'}
                >
                    {isPending ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                        <Check className="h-3 w-3" />
                    )}
                    {status === 'CONFIRMED' ? "Accepté" : "Accepter"}
                </Button>
            </CardFooter>
        </Card>
    );
}

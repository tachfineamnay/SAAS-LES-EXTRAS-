"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Check, Loader2, User, Euro, FileText } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { acceptCandidate } from "@/app/actions/missions";

interface CandidateCardProps {
  bookingId: string;
  talent: {
    id: string;
    email: string;
    profile?: {
      firstName?: string | null;
      lastName?: string | null;
      avatar?: string | null;
      jobTitle?: string | null;
    } | null;
  };
  status: string;
  motivation?: string | null;
  proposedRate?: number | null;
}

export function CandidateCard({
  bookingId,
  talent,
  status,
  motivation,
  proposedRate,
}: CandidateCardProps) {
  const [isPending, setIsPending] = useState(false);

  const firstName = talent?.profile?.firstName;
  const lastName = talent?.profile?.lastName;
  const name =
    firstName || lastName
      ? `${firstName ?? ""} ${lastName ?? ""}`.trim()
      : talent?.email ?? "Candidat";
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const handleAccept = async () => {
    setIsPending(true);
    const result = await acceptCandidate(bookingId);
    setIsPending(false);

    if (result.ok) {
      toast.success("Candidat accepté !", {
        description: "La mission a été assignée. Les autres candidatures sont automatiquement rejetées.",
      });
    } else {
      toast.error("Erreur", {
        description: result.error || "Impossible d'accepter ce candidat.",
      });
    }
  };

  const isConfirmed = status === "CONFIRMED";
  const isPending_ = status === "PENDING";

  return (
    <Card className={`flex flex-col overflow-hidden ${isConfirmed ? "border-green-500/50 bg-green-50/30" : ""}`}>
      <CardHeader className="p-4 flex flex-row items-center gap-3 space-y-0">
        <Avatar className="h-10 w-10">
          {talent?.profile?.avatar && (
            <AvatarImage src={talent.profile.avatar} alt={name} />
          )}
          <AvatarFallback className="text-xs font-semibold">
            {initials || <User className="h-5 w-5" />}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-sm truncate">{name}</h4>
          {talent?.profile?.jobTitle && (
            <p className="text-xs text-muted-foreground truncate">{talent.profile.jobTitle}</p>
          )}
        </div>
        {isConfirmed && (
          <Badge className="bg-green-600 text-white text-xs shrink-0">Accepté</Badge>
        )}
      </CardHeader>

      <CardContent className="px-4 pb-0 space-y-2 flex-grow">
        {/* Taux proposé */}
        {proposedRate != null && (
          <div className="flex items-center gap-2 text-sm">
            <Euro className="h-3.5 w-3.5 text-primary shrink-0" />
            <span className="font-semibold text-primary">{proposedRate} €/h</span>
            <span className="text-muted-foreground text-xs">proposé</span>
          </div>
        )}

        {/* Motivation */}
        {motivation && (
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <FileText className="h-3 w-3" />
              <span>Motivation</span>
            </div>
            <p className="text-xs text-foreground leading-relaxed line-clamp-3 bg-muted/40 rounded p-2">
              {motivation}
            </p>
          </div>
        )}
      </CardContent>

      <CardFooter className="p-4 mt-3 border-t bg-muted/10">
        <Button
          size="sm"
          className={`w-full gap-2 ${
            isConfirmed
              ? "bg-green-600 hover:bg-green-700 text-white cursor-default"
              : "bg-green-600 hover:bg-green-700 text-white"
          }`}
          onClick={isConfirmed ? undefined : handleAccept}
          disabled={isPending || !isPending_}
        >
          {isPending ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Check className="h-3.5 w-3.5" />
          )}
          {isConfirmed ? "Candidature acceptée" : "Accepter ce candidat"}
        </Button>
      </CardFooter>
    </Card>
  );
}

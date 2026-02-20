
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Calendar, Clock, Euro, MapPin, Building2 } from "lucide-react";
import { SerializedMission } from "@/app/actions/marketplace"; // Ensure this import works
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { QuoteCreationModal } from "../dashboard/QuoteCreationModal";
import { applyToMission } from "@/app/actions/missions";
import { toast } from "sonner";
import { useState } from "react";
import { Loader2, Zap } from "lucide-react";

interface MissionCardProps {
    mission: SerializedMission;
}

export function MissionCard({ mission }: MissionCardProps) {
    const startDate = new Date(mission.dateStart);
    const endDate = new Date(mission.dateEnd);
    const durationHours = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60);

    const clientName = mission.client?.profile?.companyName || "Établissement Confidentiel";
    const city = mission.client?.profile?.city || mission.address.split(',').pop()?.trim() || "Localisation inconnue";

    const [isPending, setIsPending] = useState(false);

    const handleApply = async () => {
        setIsPending(true);
        const result = await applyToMission(mission.id);
        setIsPending(false);

        if (result.ok) {
            toast.success("Candidature envoyée !", {
                description: "L'établissement a été notifié de votre intérêt."
            });
        } else {
            toast.error("Erreur", {
                description: result.error || "Impossible de postuler."
            });
        }
    };

    return (
        <Card className="flex flex-col h-full hover:shadow-md transition-shadow">
            <CardHeader className="p-4 pb-2 space-y-2">
                <div className="flex justify-between items-start">
                    <Badge variant={mission.isUrgent ? "destructive" : "secondary"} className="mb-2">
                        {mission.isUrgent ? "URGENT" : "Renfort"}
                    </Badge>
                    <span className="text-lg font-bold text-primary">{mission.hourlyRate}€ /h</span>
                </div>
                <h3 className="font-bold text-lg leading-tight line-clamp-2">{mission.title}</h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Building2 className="h-4 w-4" />
                    <span className="truncate">{clientName}</span>
                </div>
            </CardHeader>
            <CardContent className="p-4 pt-2 flex-grow space-y-3">
                <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>{format(startDate, "dd MMM", { locale: fr })}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>{format(startDate, "HH:mm")} - {format(endDate, "HH:mm")} ({durationHours}h)</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground col-span-2">
                        <MapPin className="h-4 w-4" />
                        <span className="truncate">{city}</span>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="p-4 pt-0">
                <Button
                    className="w-full font-bold gap-2"
                    onClick={handleApply}
                    disabled={isPending}
                >
                    {isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <Zap className="h-4 w-4 fill-current" />
                    )}
                    {isPending ? "Envoi..." : "Postuler (1-clic)"}
                </Button>
            </CardFooter>
        </Card>
    );
}

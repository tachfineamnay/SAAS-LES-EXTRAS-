
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { MapPin, Briefcase } from "lucide-react";
import { SerializedTalent } from "@/app/actions/marketplace";

interface TalentCardProps {
    talent: SerializedTalent;
}

function getInitials(firstName: string, lastName: string) {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
}

export function TalentCard({ talent }: TalentCardProps) {
    const profile = talent.profile;
    const name = profile ? `${profile.firstName} ${profile.lastName}` : "Utilisateur";
    const initials = profile ? getInitials(profile.firstName, profile.lastName) : "U";
    const job = profile?.jobTitle || "Freelance";
    const city = profile?.city || "France";

    return (
        <Card className="flex flex-col h-full hover:shadow-md transition-shadow text-center">
            <CardHeader className="p-6 pb-2 items-center space-y-3">
                <Avatar className="h-20 w-20">
                    <AvatarImage src={profile?.avatar || ""} alt={name} />
                    <AvatarFallback className="text-xl bg-primary/10 text-primary">{initials}</AvatarFallback>
                </Avatar>
                <div>
                    <h3 className="font-bold text-lg">{name}</h3>
                    <div className="flex items-center justify-center gap-1 text-sm text-primary font-medium mt-1">
                        <Briefcase className="h-3 w-3" />
                        <span>{job}</span>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-4 pt-0 flex-grow">
                <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground mt-2">
                    <MapPin className="h-3 w-3" />
                    <span>{city}</span>
                </div>
            </CardContent>
            <CardFooter className="p-4">
                <Button variant="outline" className="w-full">
                    Voir le profil
                </Button>
            </CardFooter>
        </Card>
    );
}

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Star } from "lucide-react";

type NetworkMember = {
    id: string;
    name: string;
    role: string;
    rating: number;
    avatarUrl?: string;
    status: "AVAILABLE" | "BUSY";
};

// Mock data for the network widget
const MOCK_NETWORK: NetworkMember[] = [
    { id: "1", name: "Sarah Connor", role: "Infirmière DE", rating: 4.9, status: "AVAILABLE" },
    { id: "2", name: "John Doe", role: "Aide-Soignant", rating: 4.7, status: "BUSY" },
    { id: "3", name: "Jane Smith", role: "AES", rating: 5.0, status: "AVAILABLE" },
];

type NetworkWidgetProps = {
    members?: NetworkMember[];
};

export function NetworkWidget({ members = MOCK_NETWORK }: NetworkWidgetProps) {
    return (
        <ScrollArea className="h-full -mx-6 px-6">
            <div className="space-y-4">
                {members.map((member) => (
                    <div key={member.id} className="flex items-center gap-4">
                        <div className="relative">
                            <Avatar>
                                <AvatarImage src={member.avatarUrl} />
                                <AvatarFallback>{member.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <span className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background ${member.status === "AVAILABLE" ? "bg-emerald-500" : "bg-orange-500"}`} />
                        </div>
                        <div className="flex-1 space-y-1">
                            <p className="text-sm font-medium leading-none">{member.name}</p>
                            <p className="text-xs text-muted-foreground">{member.role}</p>
                        </div>
                        <div className="flex items-center gap-1 text-primary text-xs font-medium">
                            <Star className="h-3 w-3 fill-current" />
                            {member.rating}
                        </div>
                    </div>
                ))}
            </div>
            <div className="mt-6">
                <Button variant="outline" className="w-full text-xs">
                    Voir mon réseau complet
                </Button>
            </div>
        </ScrollArea>
    );
}

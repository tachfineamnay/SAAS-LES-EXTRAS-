
"use client";

import { useState } from "react";
import { SerializedMission } from "@/app/actions/marketplace";
import { MissionCard } from "./MissionCard";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface FreelanceJobBoardProps {
    missions: SerializedMission[];
}

export function FreelanceJobBoard({ missions }: FreelanceJobBoardProps) {
    const [search, setSearch] = useState("");

    const filteredMissions = missions.filter(m => {
        if (!search) return true;
        const searchLower = search.toLowerCase();
        return (
            m.title.toLowerCase().includes(searchLower) ||
            m.address.toLowerCase().includes(searchLower) ||
            m.client?.profile?.city?.toLowerCase().includes(searchLower) ||
            false
        );
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Missions de renfort</h1>
                    <p className="text-muted-foreground">Trouvez des missions adaptées à vos compétences.</p>
                </div>
                <div className="relative w-full md:w-72">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Rechercher par ville, titre..."
                        className="pl-8"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {filteredMissions.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed rounded-xl">
                    <p className="text-muted-foreground">Aucune mission ne correspond à votre recherche.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredMissions.map((mission) => (
                        <MissionCard key={mission.id} mission={mission} />
                    ))}
                </div>
            )}
        </div>
    );
}

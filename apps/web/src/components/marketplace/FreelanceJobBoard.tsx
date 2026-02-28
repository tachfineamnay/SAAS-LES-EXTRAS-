
"use client";

import { useState } from "react";
import { SerializedMission } from "@/app/actions/marketplace";
import { MissionCard } from "./MissionCard";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import { Search, Briefcase, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

interface FreelanceJobBoardProps {
    missions: SerializedMission[];
}

export function FreelanceJobBoard({ missions }: FreelanceJobBoardProps) {
    const [search, setSearch] = useState("");

    const filteredMissions = missions.filter((m) => {
        if (!search) return true;
        const q = search.toLowerCase();
        return (
            m.title.toLowerCase().includes(q) ||
            m.address.toLowerCase().includes(q) ||
            m.client?.profile?.city?.toLowerCase().includes(q) ||
            false
        );
    });

    return (
        <div className="space-y-6">
            {/* Page header */}
            <header className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Marketplace</p>
                <h1 className="text-3xl font-bold tracking-tight">Missions de renfort</h1>
                <p className="text-sm text-muted-foreground">
                    {missions.length} mission{missions.length !== 1 ? "s" : ""} disponible{missions.length !== 1 ? "s" : ""}.
                </p>
            </header>

            {/* Search bar — glass sticky */}
            <div className="sticky top-[57px] z-20 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-3 glass-surface-dense border-y border-border/40">
                <div className="max-w-xl relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
                    <Input
                        id="mission-search"
                        placeholder="Ville, titre, établissement…"
                        className="pl-9 h-11 bg-background/60"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        aria-label="Rechercher une mission"
                    />
                </div>
            </div>

            {/* Results */}
            {filteredMissions.length === 0 ? (
                <EmptyState
                    icon={Briefcase}
                    title="Aucune mission trouvée"
                    description={
                        search
                            ? `Aucun résultat pour "${search}". Essayez un autre terme.`
                            : "Il n'y a pas encore de missions disponibles."
                    }
                    primaryAction={{ label: "Effacer la recherche", onClick: () => setSearch("") }}
                    tips="Les nouvelles missions sont publiées quotidiennement."
                />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredMissions.map((mission) => (
                        <MissionCard key={mission.id} mission={mission} />
                    ))}
                </div>
            )}
        </div>
    );
}

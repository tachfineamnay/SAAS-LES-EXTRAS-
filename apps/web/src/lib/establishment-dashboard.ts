import type { EstablishmentMission } from "@/app/actions/missions";
import { getNormalizedMissionPlanning } from "@/lib/mission-planning";

const ASSIGNED_BOOKING_STATUSES = new Set(["CONFIRMED", "ASSIGNED"]);

function hasAssignedBooking(mission: EstablishmentMission) {
    return mission.bookings?.some((booking) => ASSIGNED_BOOKING_STATUSES.has(booking.status)) ?? false;
}

function isAssignedMission(mission: EstablishmentMission) {
    if (mission.status === "CANCELLED" || mission.status === "COMPLETED") {
        return false;
    }

    return mission.status === "ASSIGNED" || hasAssignedBooking(mission);
}

function getNextMissionStart(mission: EstablishmentMission, now: Date) {
    return (
        getNormalizedMissionPlanning(mission).find(
            (slot) => slot.start.getTime() >= now.getTime(),
        )?.start ?? null
    );
}

export function getNextAssignedMission(
    missions: EstablishmentMission[],
    now = new Date(),
): EstablishmentMission | null {
    return (
        missions
            .filter(isAssignedMission)
            .map((mission) => ({
                mission,
                start: getNextMissionStart(mission, now),
            }))
            .filter((entry): entry is { mission: EstablishmentMission; start: Date } => entry.start !== null)
            .sort((left, right) => left.start.getTime() - right.start.getTime())[0]?.mission ?? null
    );
}

import { format, isValid } from "date-fns";

export type MissionSlot = {
  date: string;
  heureDebut: string;
  heureFin: string;
};

export type MissionPlanningSource = {
  dateStart?: string | null;
  dateEnd?: string | null;
  slots?: unknown;
};

export type NormalizedMissionSlot = MissionSlot & {
  start: Date;
  end: Date;
  key: string;
};

export type MissionSlotValidationIssue = {
  index: number;
  field: keyof MissionSlot;
  message: string;
};

function isMissionSlot(value: unknown): value is MissionSlot {
  if (!value || typeof value !== "object") return false;

  const slot = value as Record<string, unknown>;
  return (
    typeof slot.date === "string" &&
    typeof slot.heureDebut === "string" &&
    typeof slot.heureFin === "string"
  );
}

export function toNormalizedMissionSlot(slot: MissionSlot): NormalizedMissionSlot | null {
  const start = new Date(`${slot.date}T${slot.heureDebut}`);
  const end = new Date(`${slot.date}T${slot.heureFin}`);

  if (!isValid(start) || !isValid(end) || end <= start) {
    return null;
  }

  return {
    ...slot,
    start,
    end,
    key: `${slot.date}|${slot.heureDebut}|${slot.heureFin}`,
  };
}

export function sortMissionSlots<T extends MissionSlot>(slots: T[]): T[] {
  return [...slots].sort((left, right) => {
    const leftDate = new Date(`${left.date}T${left.heureDebut}`).getTime();
    const rightDate = new Date(`${right.date}T${right.heureDebut}`).getTime();
    return leftDate - rightDate;
  });
}

function fallbackMissionSlot(source: MissionPlanningSource): NormalizedMissionSlot[] {
  if (!source.dateStart || !source.dateEnd) return [];

  const start = new Date(source.dateStart);
  const end = new Date(source.dateEnd);
  if (!isValid(start) || !isValid(end) || end <= start) return [];

  return [
    {
      date: format(start, "yyyy-MM-dd"),
      heureDebut: format(start, "HH:mm"),
      heureFin: format(end, "HH:mm"),
      start,
      end,
      key: `${format(start, "yyyy-MM-dd")}|${format(start, "HH:mm")}|${format(end, "HH:mm")}`,
    },
  ];
}

export function getNormalizedMissionSlots(source: MissionPlanningSource): NormalizedMissionSlot[] {
  if (Array.isArray(source.slots)) {
    const normalized = source.slots
      .filter(isMissionSlot)
      .map(toNormalizedMissionSlot)
      .filter((slot): slot is NormalizedMissionSlot => slot !== null)
      .sort((left, right) => left.start.getTime() - right.start.getTime());

    if (normalized.length > 0) {
      return normalized;
    }
  }

  return fallbackMissionSlot(source);
}

export function getMissionPlanning(source: MissionPlanningSource, now = new Date()) {
  const slots = getNormalizedMissionSlots(source);
  const firstSlot = slots[0] ?? null;
  const nextSlot = slots.find((slot) => slot.start.getTime() >= now.getTime()) ?? null;

  return {
    slots,
    firstSlot,
    nextSlot,
    visibleSlots: slots.slice(0, 2),
    extraCount: Math.max(slots.length - 2, 0),
  };
}

export function validateMissionSlots(
  slots: MissionSlot[],
  now = new Date(),
): MissionSlotValidationIssue[] {
  const issues: MissionSlotValidationIssue[] = [];
  const parsedSlots = slots.map((slot, index) => ({
    index,
    normalized: toNormalizedMissionSlot(slot),
  }));

  for (const item of parsedSlots) {
    const source = slots[item.index];
    if (!source?.date || !source.heureDebut || !source.heureFin) {
      continue;
    }

    if (!item.normalized) {
      issues.push({
        index: item.index,
        field: "date",
        message: "Le créneau est invalide.",
      });
      continue;
    }

    if (item.normalized.start.getTime() < now.getTime()) {
      issues.push({
        index: item.index,
        field: "date",
        message: "Ce créneau est déjà passé.",
      });
    }
  }

  const validSlots = parsedSlots
    .filter((item): item is { index: number; normalized: NormalizedMissionSlot } => item.normalized !== null)
    .sort((left, right) => left.normalized.start.getTime() - right.normalized.start.getTime());

  const seenKeys = new Map<string, number>();
  for (const item of validSlots) {
    const previousIndex = seenKeys.get(item.normalized.key);
    if (previousIndex !== undefined) {
      issues.push({
        index: item.index,
        field: "date",
        message: "Ce créneau fait doublon avec un autre.",
      });
      continue;
    }
    seenKeys.set(item.normalized.key, item.index);
  }

  for (let index = 1; index < validSlots.length; index += 1) {
    const current = validSlots[index];
    const previous = validSlots[index - 1];

    if (
      current &&
      previous &&
      current.normalized.key !== previous.normalized.key &&
      current.normalized.start.getTime() < previous.normalized.end.getTime()
    ) {
      issues.push({
        index: current.index,
        field: "date",
        message: "Ce créneau chevauche un autre créneau.",
      });
    }
  }

  return issues;
}

export type MissionSlotInput = {
  date: string;
  heureDebut: string;
  heureFin: string;
};

export type ParsedMissionSlot = MissionSlotInput & {
  start: Date;
  end: Date;
  key: string;
};

export type MissionSlotValidationIssue = {
  index: number;
  message: string;
};

function isMissionSlotInput(value: unknown): value is MissionSlotInput {
  if (!value || typeof value !== "object") return false;

  const slot = value as Record<string, unknown>;
  return (
    typeof slot.date === "string" &&
    typeof slot.heureDebut === "string" &&
    typeof slot.heureFin === "string"
  );
}

export function parseMissionSlot(slot: MissionSlotInput): ParsedMissionSlot | null {
  const start = new Date(`${slot.date}T${slot.heureDebut}`);
  const end = new Date(`${slot.date}T${slot.heureFin}`);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) {
    return null;
  }

  return {
    ...slot,
    start,
    end,
    key: `${slot.date}|${slot.heureDebut}|${slot.heureFin}`,
  };
}

export function sortMissionSlots<T extends MissionSlotInput>(slots: T[]): T[] {
  return [...slots].sort((left, right) => {
    const leftDate = new Date(`${left.date}T${left.heureDebut}`).getTime();
    const rightDate = new Date(`${right.date}T${right.heureDebut}`).getTime();
    return leftDate - rightDate;
  });
}

export function normalizeMissionSlots(slots: MissionSlotInput[]): ParsedMissionSlot[] {
  return slots
    .map(parseMissionSlot)
    .filter((slot): slot is ParsedMissionSlot => slot !== null)
    .sort((left, right) => left.start.getTime() - right.start.getTime());
}

export function validateMissionSlots(
  slots: MissionSlotInput[],
  now = new Date(),
): MissionSlotValidationIssue[] {
  const issues: MissionSlotValidationIssue[] = [];
  const parsedSlots = slots.map((slot, index) => ({
    index,
    slot,
    normalized: parseMissionSlot(slot),
  }));

  for (const item of parsedSlots) {
    if (!item.slot.date || !item.slot.heureDebut || !item.slot.heureFin) {
      issues.push({
        index: item.index,
        message: `Slot ${item.index + 1} is incomplete`,
      });
      continue;
    }

    if (!item.normalized) {
      issues.push({
        index: item.index,
        message: `Slot ${item.index + 1} is invalid`,
      });
      continue;
    }

    if (item.normalized.start.getTime() < now.getTime()) {
      issues.push({
        index: item.index,
        message: `Slot ${item.index + 1} is in the past`,
      });
    }
  }

  const validSlots = parsedSlots
    .filter((item): item is { index: number; slot: MissionSlotInput; normalized: ParsedMissionSlot } => item.normalized !== null)
    .sort((left, right) => left.normalized.start.getTime() - right.normalized.start.getTime());

  const seenKeys = new Set<string>();
  for (const item of validSlots) {
    if (seenKeys.has(item.normalized.key)) {
      issues.push({
        index: item.index,
        message: `Slot ${item.index + 1} duplicates another slot`,
      });
      continue;
    }
    seenKeys.add(item.normalized.key);
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
        message: `Slot ${current.index + 1} overlaps another slot`,
      });
    }
  }

  return issues;
}

export function coerceMissionSlots(value: unknown): MissionSlotInput[] {
  if (!Array.isArray(value)) return [];
  return value.filter(isMissionSlotInput);
}

export function missionHasSlotOnDate(value: unknown, date: string): boolean {
  return coerceMissionSlots(value).some((slot) => slot.date === date);
}

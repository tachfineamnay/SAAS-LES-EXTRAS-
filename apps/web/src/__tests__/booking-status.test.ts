import { describe, expect, it } from "vitest";
import type { BookingLineStatus } from "@/app/actions/bookings";
import {
  getBookingStatusLabel,
  getBookingStatusVariant,
  isBookingActive,
  isBookingCancellable,
} from "@/lib/booking-status";

const expectedStatuses: Array<{
  status: BookingLineStatus;
  label: string;
  variant: string;
  active: boolean;
  cancellable: boolean;
}> = [
  { status: "PENDING", label: "En attente", variant: "amber", active: false, cancellable: true },
  { status: "QUOTE_SENT", label: "Devis envoyé", variant: "info", active: false, cancellable: true },
  { status: "QUOTE_ACCEPTED", label: "Devis accepté", variant: "teal", active: true, cancellable: true },
  { status: "CONFIRMED", label: "Confirmé", variant: "teal", active: true, cancellable: true },
  { status: "ASSIGNED", label: "Assigné", variant: "info", active: true, cancellable: true },
  { status: "IN_PROGRESS", label: "En cours", variant: "info", active: true, cancellable: false },
  { status: "COMPLETED", label: "Terminé", variant: "outline", active: false, cancellable: false },
  { status: "COMPLETED_AWAITING_PAYMENT", label: "Paiement en attente", variant: "amber", active: false, cancellable: false },
  { status: "AWAITING_PAYMENT", label: "Paiement en attente", variant: "amber", active: false, cancellable: false },
  { status: "PAID", label: "Payé", variant: "emerald", active: false, cancellable: false },
  { status: "CANCELLED", label: "Annulé", variant: "red", active: false, cancellable: false },
];

const validBadgeVariants = new Set(["amber", "teal", "emerald", "red", "info", "outline", "quiet"]);

describe("booking-status", () => {
  it("centralise les labels et variants des statuts connus", () => {
    for (const expected of expectedStatuses) {
      expect(getBookingStatusLabel(expected.status)).toBe(expected.label);
      expect(getBookingStatusVariant(expected.status)).toBe(expected.variant);
    }
  });

  it("retourne un label français pour chaque statut connu", () => {
    for (const expected of expectedStatuses) {
      const label = getBookingStatusLabel(expected.status);

      expect(label).toBe(expected.label);
      expect(label).not.toBe(expected.status);
      expect(label).not.toMatch(/_/);
    }
  });

  it("retourne un variant Badge valide pour chaque statut connu", () => {
    for (const expected of expectedStatuses) {
      expect(validBadgeVariants.has(getBookingStatusVariant(expected.status))).toBe(true);
    }
  });

  it("centralise les statuts actifs et annulables", () => {
    for (const expected of expectedStatuses) {
      expect(isBookingActive(expected.status)).toBe(expected.active);
      expect(isBookingCancellable(expected.status)).toBe(expected.cancellable);
    }
  });

  it("garde un fallback lisible pour un statut inconnu", () => {
    expect(getBookingStatusLabel("UNKNOWN_STATUS")).toBe("UNKNOWN_STATUS");
    expect(getBookingStatusVariant("UNKNOWN_STATUS")).toBe("outline");
    expect(isBookingActive("UNKNOWN_STATUS")).toBe(false);
    expect(isBookingCancellable("UNKNOWN_STATUS")).toBe(false);
  });
});

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MesAteliersClient } from "@/components/dashboard/MesAteliersClient";
import type { MesAtelierItem } from "@/app/actions/marketplace";
import type { BookingLine } from "@/app/actions/bookings";

vi.mock("@/lib/stores/useUIStore", () => ({
  useUIStore: (selector: (s: { openPublishModal: () => void }) => unknown) =>
    selector({ openPublishModal: vi.fn() }),
}));

const ateliers: MesAtelierItem[] = [
  {
    id: "a-1",
    title: "Atelier communication",
    description: "Description",
    price: 220,
    type: "WORKSHOP",
    capacity: 10,
    pricingType: "SESSION",
    pricePerParticipant: null,
    durationMinutes: 120,
    category: "COMMUNICATION",
    publicCible: ["adultes"],
    materials: null,
    objectives: null,
    methodology: null,
    evaluation: null,
    slots: [{ date: "2026-04-01", heureDebut: "09:00", heureFin: "11:00" }],
    status: "ACTIVE",
    owner: {
      id: "f-1",
      profile: {
        firstName: "Sarah",
        lastName: "Martin",
        avatar: null,
        jobTitle: "Éducatrice",
        bio: null,
      },
    },
  },
];

const serviceBookings: BookingLine[] = [
  {
    lineId: "b-1",
    lineType: "SERVICE_BOOKING",
    date: "2026-04-01T09:00:00.000Z",
    typeLabel: "Atelier",
    interlocutor: "etab@test.com",
    status: "PENDING",
    address: "Adresse",
    contactEmail: "etab@test.com",
  },
  {
    lineId: "b-2",
    lineType: "SERVICE_BOOKING",
    date: "2026-04-03T09:00:00.000Z",
    typeLabel: "Atelier",
    interlocutor: "etab2@test.com",
    status: "CONFIRMED",
    address: "Adresse",
    contactEmail: "etab2@test.com",
  },
];

describe("MesAteliersClient", () => {
  it("affiche la liste des ateliers du freelance", () => {
    render(<MesAteliersClient ateliers={ateliers} serviceBookings={serviceBookings} />);
    expect(screen.getByText(/atelier communication/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /atelier communication/i })).toHaveAttribute(
      "href",
      "/marketplace/services/a-1",
    );
  });

  it("affiche un état vide quand aucun atelier", () => {
    render(<MesAteliersClient ateliers={[]} serviceBookings={[]} />);
    expect(screen.getByText(/vous n'avez pas encore publié d'atelier/i)).toBeInTheDocument();
  });

  it("affiche un état erreur si error est fourni", () => {
    render(<MesAteliersClient ateliers={[]} serviceBookings={[]} error="Impossible de charger vos ateliers." />);
    expect(screen.getByRole("heading", { name: /impossible de charger vos ateliers/i })).toBeInTheDocument();
  });
});

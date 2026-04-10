import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MissionCard } from "@/components/marketplace/MissionCard";
import type { SerializedMission } from "@/app/actions/marketplace";

vi.mock("@/lib/stores/useUIStore", () => ({
  useUIStore: (selector: (s: { openApplyModal: (id: string) => void }) => unknown) =>
    selector({ openApplyModal: vi.fn() }),
}));

// Minimal mock mission data
const mission: SerializedMission = {
  id: "mission-99",
  title: "Aide-soignant(e) de nuit",
  dateStart: "2026-04-01T21:00:00.000Z",
  dateEnd: "2026-04-02T07:00:00.000Z",
  address: "12 rue de la Paix, Paris",
  hourlyRate: 28,
  status: "OPEN",
  isRenfort: true,
  metier: "AIDE_SOIGNANT",
  shift: "NUIT",
  city: "Paris",
  zipCode: "75001",
  isUrgent: false,
  planning: [
    { dateStart: "2026-04-03", heureDebut: "08:00", dateEnd: "2026-04-03", heureFin: "12:00" },
    { dateStart: "2026-04-05", heureDebut: "14:00", dateEnd: "2026-04-05", heureFin: "18:00" },
    { dateStart: "2026-04-06", heureDebut: "09:00", dateEnd: "2026-04-06", heureFin: "11:00" },
  ],
  establishment: { profile: { companyName: "EHPAD Les Lilas", city: "Paris", avatar: null } },
};

describe("MissionCard", () => {
  it("affiche le titre / métier de la mission", () => {
    render(<MissionCard mission={mission} />);
    // Aide-soignant is displayed via getMetierById label
    expect(screen.getByRole("heading")).toBeInTheDocument();
  });

  it("le titre est un lien vers la page de détail", () => {
    render(<MissionCard mission={mission} />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", `/marketplace/missions/${mission.id}`);
  });

  it("affiche le bouton 'Postuler'", () => {
    render(<MissionCard mission={mission} />);
    expect(screen.getByRole("button", { name: /postuler/i })).toBeInTheDocument();
  });

  it("le bouton Postuler appelle onApply avec la mission", () => {
    const onApply = vi.fn();
    render(<MissionCard mission={mission} onApply={onApply} />);
    fireEvent.click(screen.getByRole("button", { name: /postuler/i }));
    expect(onApply).toHaveBeenCalledWith(mission);
  });

  it("affiche le badge URGENT quand isUrgent est vrai", () => {
    render(<MissionCard mission={{ ...mission, isUrgent: true }} />);
    expect(screen.getByText("URGENT")).toBeInTheDocument();
  });

  it("affiche le nom de l'établissement", () => {
    render(<MissionCard mission={mission} />);
    expect(screen.getByText("EHPAD Les Lilas")).toBeInTheDocument();
  });

  it("affiche les deux premiers créneaux et un résumé du surplus", () => {
    render(<MissionCard mission={mission} />);
    expect(screen.getByText(/03 avr/i)).toBeInTheDocument();
    expect(screen.getByText(/05 avr/i)).toBeInTheDocument();
    expect(screen.getByText(/\+1 plage\(s\) supplémentaire\(s\)/i)).toBeInTheDocument();
  });
});

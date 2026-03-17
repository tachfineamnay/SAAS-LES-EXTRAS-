import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MatchingMissionsWidget } from "@/components/dashboard/MatchingMissionsWidget";
import type { MatchingMission } from "@/components/dashboard/MatchingMissionsWidget";

const mockOpenApplyModal = vi.fn();

vi.mock("@/lib/stores/useUIStore", () => ({
  useUIStore: (selector: (s: { openApplyModal: (id: string) => void }) => unknown) =>
    selector({ openApplyModal: mockOpenApplyModal }),
}));

const missions: MatchingMission[] = [
  { id: "m-1", title: "Aide-soignant(e)", establishment: "EHPAD A", city: "Paris", urgent: false },
  { id: "m-2", title: "Infirmier(e)", establishment: "Clinique B", city: "Lyon", urgent: true },
  { id: "m-3", title: "ASH", establishment: "MAS C", city: "Bordeaux" },
];

describe("MatchingMissionsWidget", () => {
  it("affiche les missions passées en props", () => {
    render(<MatchingMissionsWidget missions={missions} />);
    expect(screen.getByText("Aide-soignant(e)")).toBeInTheDocument();
    expect(screen.getByText("Infirmier(e)")).toBeInTheDocument();
    expect(screen.getByText("ASH")).toBeInTheDocument();
  });

  it("affiche le bouton 'Voir toutes les missions'", () => {
    render(<MatchingMissionsWidget missions={missions} />);
    expect(screen.getByRole("link", { name: /voir toutes les missions/i })).toBeInTheDocument();
  });

  it("les titres de mission sont des liens vers la page de détail", () => {
    render(<MatchingMissionsWidget missions={missions} />);
    const detailLinks = screen.getAllByRole("link").filter((l) =>
      l.getAttribute("href")?.startsWith("/marketplace/missions/"),
    );
    expect(detailLinks.length).toBeGreaterThanOrEqual(1);
  });

  it("affiche l'état vide quand missions=[]", () => {
    render(<MatchingMissionsWidget missions={[]} />);
    expect(screen.getByText(/aucune nouvelle mission/i)).toBeInTheDocument();
  });

  it("appelle openApplyModal au clic sur Postuler", () => {
    render(<MatchingMissionsWidget missions={missions} />);
    const buttons = screen.getAllByRole("button", { name: /postuler/i });
    fireEvent.click(buttons[0]!);
    expect(mockOpenApplyModal).toHaveBeenCalledWith("m-1");
  });

  it("affiche max 3 cards même avec 5 missions", () => {
    const many = [...missions, { id: "m-4", title: "M4", establishment: "E", city: "C" }, { id: "m-5", title: "M5", establishment: "E", city: "C" }];
    render(<MatchingMissionsWidget missions={many} />);
    const cards = screen.getAllByRole("article");
    expect(cards).toHaveLength(3);
  });
});

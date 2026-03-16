import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { EstablishmentCatalogue } from "@/components/marketplace/EstablishmentCatalogue";
import type { SerializedService } from "@/app/actions/marketplace";

const services: SerializedService[] = [
  {
    id: "service-1",
    title: "Atelier gestion des émotions",
    description: "Atelier de 2h",
    price: 250,
    type: "WORKSHOP",
    capacity: 12,
    pricingType: "SESSION",
    pricePerParticipant: null,
    durationMinutes: 120,
    category: "GESTION_EMOTIONS",
    publicCible: ["enfants"],
    materials: null,
    objectives: null,
    methodology: null,
    evaluation: null,
    slots: [{ date: "2026-04-01", heureDebut: "09:00", heureFin: "11:00" }],
    owner: {
      id: "freelance-1",
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

describe("EstablishmentCatalogue - ateliers", () => {
  it("affiche le catalogue et les cartes ateliers", () => {
    render(<EstablishmentCatalogue services={services} freelances={[]} />);
    expect(screen.getByRole("heading", { name: /catalogue & annuaire/i })).toBeInTheDocument();
    expect(screen.getByText(/atelier gestion des émotions/i)).toBeInTheDocument();
  });

  it("affiche un état vide quand aucun atelier n'est disponible", () => {
    render(<EstablishmentCatalogue services={[]} freelances={[]} />);
    expect(screen.getByText(/aucune formation disponible/i)).toBeInTheDocument();
  });

  it("affiche un message d'erreur dégradé si catalogueError est fourni", () => {
    render(
      <EstablishmentCatalogue
        services={services}
        freelances={[]}
        catalogueError="Impossible de charger certaines données du catalogue."
      />,
    );
    expect(screen.getByText(/impossible de charger certaines données du catalogue/i)).toBeInTheDocument();
  });
});

import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { FreelanceDashboard } from "@/app/(dashboard)/dashboard/_components/FreelanceDashboard";
import type { BookingLine } from "@/app/actions/bookings";
import type { MyDeskRequest } from "@/app/actions/desk";
import type { MesAtelierItem } from "@/app/actions/marketplace";

vi.mock("@/components/dashboard/MatchingMissionsWidget", () => ({
  MatchingMissionsWidget: () => <div>Missions ciblées</div>,
}));

vi.mock("@/components/dashboard/BookingListWidget", () => ({
  BookingListWidget: ({ emptyMessage }: { emptyMessage?: string }) => (
    <div>{emptyMessage}</div>
  ),
}));

vi.mock("@/components/dashboard/TrustChecklistWidget", () => ({
  TrustChecklistWidget: () => <div>Confiance freelance</div>,
}));

vi.mock("@/components/dashboard/NextMissionCard", () => ({
  NextMissionCard: () => <div>Prochaine mission</div>,
}));

vi.mock("@/components/dashboard/RecentReviewsWidget", () => ({
  RecentReviewsWidget: () => <div>Avis récents</div>,
}));

vi.mock("@/components/layout/BentoSection", () => ({
  BentoSection: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

const service: MesAtelierItem = {
  id: "svc-1",
  title: "Atelier communication",
  description: null,
  price: 120,
  type: "WORKSHOP",
  capacity: 10,
  pricingType: "SESSION",
  pricePerParticipant: null,
  durationMinutes: 60,
  category: null,
  publicCible: null,
  materials: null,
  objectives: null,
  methodology: null,
  evaluation: null,
  slots: null,
  status: "ACTIVE",
};

const draftService: MesAtelierItem = {
  ...service,
  id: "svc-2",
  title: "Formation posture professionnelle",
  type: "TRAINING",
  status: "DRAFT",
};

const serviceBooking: BookingLine = {
  lineId: "sb-1",
  lineType: "SERVICE_BOOKING",
  date: "2026-04-12",
  typeLabel: "Atelier",
  interlocutor: "EHPAD A",
  status: "PENDING",
  address: "Paris",
  contactEmail: "contact@example.com",
};

const deskRequest: MyDeskRequest = {
  id: "dr-1",
  type: "MISSION_INFO_REQUEST",
  status: "OPEN",
  message: "Question sur le public",
  response: null,
  answeredAt: null,
  createdAt: "2026-04-10T10:00:00.000Z",
  mission: { id: "m-1", title: "Renfort éducateur spécialisé" },
  answeredBy: null,
};

describe("FreelanceDashboard", () => {
  it("met en avant la plateforme hybride, les services et les demandes Desk", () => {
    render(
      <FreelanceDashboard
        confirmedBookings={[]}
        pendingBookings={[]}
        serviceBookings={[serviceBooking]}
        bookingsError={null}
        matchingMissions={[]}
        availableMissionsError={null}
        nextMission={undefined}
        recentReviews={[]}
        recentReviewsError={null}
        isAvailable
        services={[service, draftService]}
        servicesError={null}
        deskRequests={[deskRequest]}
        deskRequestsError={null}
        completedMissionsThisMonth={1}
        activeServices={1}
        openDeskRequests={1}
        averageRating={4.5}
      />,
    );

    expect(
      screen.getByText(/pilotez vos missions de renfort, vos services et vos échanges avec l'équipe/i),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /explorer missions & services/i })).toHaveAttribute(
      "href",
      "/marketplace",
    );
    expect(screen.getByRole("link", { name: /proposer mes services/i })).toHaveAttribute(
      "href",
      "/dashboard/ateliers",
    );

    expect(screen.getByText(/missions ce mois/i)).toBeInTheDocument();
    expect(screen.getByText(/services actifs/i)).toBeInTheDocument();
    expect(screen.getByText(/demandes ouvertes/i)).toBeInTheDocument();
    expect(screen.getByText(/note moyenne/i)).toBeInTheDocument();
    expect(screen.queryByText(/ca ce mois/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/\+12%/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/profil complété/i)).not.toBeInTheDocument();

    expect(screen.getByRole("heading", { name: /mes services/i })).toBeInTheDocument();
    expect(screen.getByText(/1 brouillon à finaliser/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /gérer mes services/i })).toHaveAttribute(
      "href",
      "/dashboard/ateliers",
    );

    expect(screen.getByRole("heading", { name: /mes demandes/i })).toBeInTheDocument();
    expect(screen.getByText(/dernière demande : renfort éducateur spécialisé/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /voir mes demandes/i })).toHaveAttribute(
      "href",
      "/dashboard/demandes",
    );

    expect(screen.queryByText(/voir les missions/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/total gagné/i)).not.toBeInTheDocument();
  });
});

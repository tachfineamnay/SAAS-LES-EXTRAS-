import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import type { BookingLine } from "@/app/actions/bookings";
import type { EstablishmentMission } from "@/app/actions/missions";
import type { EstablishmentDashboardProps } from "@/app/(dashboard)/dashboard/_components/EstablishmentDashboard";

vi.mock("@/components/dashboard/NextMissionCard", () => ({
  NextMissionCard: ({ title }: { title: string }) => (
    <div data-testid="next-mission-card">{title}</div>
  ),
}));

vi.mock("@/components/dashboard/RecentReviewsWidget", () => ({
  RecentReviewsWidget: () => <div>Avis récents</div>,
}));

vi.mock("@/components/dashboard/establishment/RenfortsWidget", () => ({
  RenfortsWidget: () => <div>Renforts actifs</div>,
}));

vi.mock("@/components/dashboard/establishment/PublishRenfortButton", () => ({
  PublishRenfortButton: ({ label = "Publier un renfort" }: { label?: string }) => (
    <button type="button">{label}</button>
  ),
}));

vi.mock("@/components/dashboard/establishment/EstablishmentInvoicesWidget", () => ({
  EstablishmentInvoicesWidget: () => <div>Factures établissement</div>,
}));

vi.mock("@/components/dashboard/establishment/EstablishmentChecklistWidget", () => ({
  EstablishmentChecklistWidget: () => <div>Checklist établissement</div>,
}));

vi.mock("@/components/dashboard/CreditsWidget", () => ({
  CreditsWidget: ({ credits }: { credits: number | null }) => <div>{credits ?? "—"} crédits</div>,
}));

vi.mock("@/components/layout/BentoSection", () => ({
  BentoSection: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  BentoItem: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

const { EstablishmentDashboard } = await import(
  "@/app/(dashboard)/dashboard/_components/EstablishmentDashboard"
);

const assignedMission: EstablishmentMission = {
  id: "mission-assigned",
  title: "Renfort éducateur spécialisé",
  dateStart: "2099-04-12T10:00:00.000Z",
  dateEnd: "2099-04-12T18:00:00.000Z",
  address: "Lyon",
  hourlyRate: 28,
  status: "ASSIGNED",
  isRenfort: true,
  city: "Lyon",
  bookings: [{ id: "booking-assigned", status: "CONFIRMED", freelanceId: "free-1" }],
};

const awaitingPaymentBooking: BookingLine = {
  lineId: "line-awaiting-payment",
  lineType: "MISSION",
  date: "2099-04-12T10:00:00.000Z",
  typeLabel: "Mission SOS",
  interlocutor: "Nora Martin",
  status: "COMPLETED_AWAITING_PAYMENT",
  address: "Lyon",
  contactEmail: "contact@example.com",
  relatedBookingId: "booking-assigned",
};

function renderDashboard(overrides: Partial<EstablishmentDashboardProps> = {}) {
  const props: EstablishmentDashboardProps = {
    activeMissions: [],
    missionsError: null,
    pendingQuotes: [],
    quotesError: null,
    invoices: [],
    invoicesError: null,
    availableCredits: 12,
    creditsError: null,
    pendingCandidatures: 2,
    awaitingPaymentBookings: [],
    confirmedBookings: [],
    completedBookings: [],
    bookingsError: null,
    nextMission: null,
    recentReviews: [],
    recentReviewsError: null,
    openDeskRequests: [],
    deskRequestsError: null,
    renfortsToFill: 1,
    upcomingInterventions: 3,
    ...overrides,
  };

  return render(<EstablishmentDashboard {...props} />);
}

describe("EstablishmentDashboard", () => {
  it("affiche les KPI actionnables sans Note moyenne", () => {
    renderDashboard();

    expect(screen.getByRole("link", { name: /renforts à pourvoir/i })).toHaveAttribute(
      "href",
      "/dashboard/renforts",
    );
    expect(screen.getByRole("link", { name: /candidatures à décider/i })).toHaveAttribute(
      "href",
      "/dashboard/renforts",
    );
    expect(screen.getByRole("link", { name: /interventions à venir/i })).toHaveAttribute(
      "href",
      "/bookings",
    );
    expect(screen.getByRole("link", { name: /crédits disponibles/i })).toHaveAttribute(
      "href",
      "/dashboard/packs",
    );
    expect(screen.queryByText(/note moyenne/i)).not.toBeInTheDocument();
  });

  it("n'affiche pas la prochaine intervention quand aucune mission assignée future n'est fournie", () => {
    renderDashboard({
      activeMissions: [
        {
          ...assignedMission,
          id: "mission-open",
          status: "OPEN",
          bookings: [],
        },
      ],
      nextMission: null,
    });

    expect(screen.queryByTestId("next-mission-card")).not.toBeInTheDocument();
  });

  it("affiche la prochaine intervention pour une mission assignée future", () => {
    renderDashboard({ nextMission: assignedMission });

    expect(screen.getByTestId("next-mission-card")).toHaveTextContent(
      "Renfort éducateur spécialisé",
    );
  });

  it("ne met pas les propositions reçues en action prioritaire quand les devis sont vides", () => {
    renderDashboard({ pendingQuotes: [] });

    expect(screen.queryByText(/propositions reçues/i)).not.toBeInTheDocument();
  });

  it("ne montre pas deux CTA contradictoires pour une même mission terminée", () => {
    renderDashboard({ awaitingPaymentBookings: [awaitingPaymentBooking] });

    expect(screen.getByRole("button", { name: /valider les heures/i })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /valider le paiement/i })).not.toBeInTheDocument();
  });
});

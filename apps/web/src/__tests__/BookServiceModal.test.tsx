import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BookServiceModal } from "@/components/modals/BookServiceModal";

const mockCloseBookServiceModal = vi.fn();
const mockRefresh = vi.fn();
const mockToastSuccess = vi.fn();
const mockGetService = vi.fn();
const mockBookService = vi.fn();

vi.mock("@/lib/stores/useUIStore", () => ({
  useUIStore: (selector: (s: {
    isBookServiceModalOpen: boolean;
    bookServiceModalId: string | null;
    closeBookServiceModal: () => void;
  }) => unknown) =>
    selector({
      isBookServiceModalOpen: true,
      bookServiceModalId: "service-1",
      closeBookServiceModal: mockCloseBookServiceModal,
    }),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: mockRefresh }),
}));

vi.mock("sonner", () => ({
  toast: {
    success: (...args: unknown[]) => mockToastSuccess(...args),
  },
}));

vi.mock("@/app/actions/marketplace", () => ({
  getService: (...args: unknown[]) => mockGetService(...args),
  bookService: (...args: unknown[]) => mockBookService(...args),
}));

describe("BookServiceModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10);

    mockGetService.mockResolvedValue({
      id: "service-1",
      title: "Atelier test",
      pricingType: "SESSION",
      price: 200,
      pricePerParticipant: null,
      durationMinutes: 120,
      capacity: 10,
      slots: [{ date: futureDate, heureDebut: "09:00", heureFin: "11:00" }],
    });
    mockBookService.mockResolvedValue({ ok: true });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("réservation réussie : envoie la demande et refresh l'UI", async () => {
    render(<BookServiceModal />);

    await waitFor(() => {
      expect(mockGetService).toHaveBeenCalledWith("service-1");
    });

    const slotButton = screen
      .getAllByRole("button")
      .find((button) => button.textContent?.includes("09:00"));
    expect(slotButton).toBeTruthy();
    fireEvent.click(slotButton!);

    fireEvent.click(screen.getByRole("button", { name: /suivant/i }));
    fireEvent.click(screen.getByRole("button", { name: /suivant/i }));
    fireEvent.click(screen.getByRole("button", { name: /envoyer la demande/i }));

    await waitFor(() => {
      expect(mockBookService).toHaveBeenCalledWith(
        "service-1",
        expect.any(Date),
        undefined,
        1,
      );
      expect(mockToastSuccess).toHaveBeenCalled();
      expect(mockRefresh).toHaveBeenCalled();
    });
  });

  it("réservation refusée (doublon) : affiche un message lisible sans fermer la modale", async () => {
    mockBookService.mockResolvedValue({
      error: "Vous avez déjà une demande active pour cet atelier.",
    });

    render(<BookServiceModal />);

    await waitFor(() => {
      expect(mockGetService).toHaveBeenCalled();
    });

    const slotButton = screen
      .getAllByRole("button")
      .find((button) => button.textContent?.includes("09:00"));
    fireEvent.click(slotButton!);

    fireEvent.click(screen.getByRole("button", { name: /suivant/i }));
    fireEvent.click(screen.getByRole("button", { name: /suivant/i }));
    fireEvent.click(screen.getByRole("button", { name: /envoyer la demande/i }));

    await waitFor(() => {
      expect(
        screen.getByText("Vous avez déjà une demande active pour cet atelier."),
      ).toBeInTheDocument();
    });
    expect(mockCloseBookServiceModal).not.toHaveBeenCalled();
  });

  it("réservation refusée (erreur métier) : affiche le message dans la modale", async () => {
    mockBookService.mockResolvedValue({
      error: "Cet atelier n'est plus disponible à la réservation.",
    });

    render(<BookServiceModal />);

    await waitFor(() => {
      expect(mockGetService).toHaveBeenCalled();
    });

    const slotButton = screen
      .getAllByRole("button")
      .find((button) => button.textContent?.includes("09:00"));
    fireEvent.click(slotButton!);

    fireEvent.click(screen.getByRole("button", { name: /suivant/i }));
    fireEvent.click(screen.getByRole("button", { name: /suivant/i }));
    fireEvent.click(screen.getByRole("button", { name: /envoyer la demande/i }));

    await waitFor(() => {
      expect(
        screen.getByText("Cet atelier n'est plus disponible à la réservation."),
      ).toBeInTheDocument();
    });
  });
});

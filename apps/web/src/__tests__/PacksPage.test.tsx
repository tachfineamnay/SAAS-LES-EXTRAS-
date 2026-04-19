import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const mockGetCreditsSummarySafe = vi.fn();
const mockBuyPack = vi.fn();

vi.mock("@/actions/credits", () => ({
  getCreditsSummarySafe: () => mockGetCreditsSummarySafe(),
  buyPack: (...args: unknown[]) => mockBuyPack(...args),
}));

const { default: PacksPage } = await import("@/app/(dashboard)/dashboard/packs/page");

describe("PacksPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal("confirm", vi.fn(() => true));
    mockGetCreditsSummarySafe.mockResolvedValue({
      availableCredits: null,
      purchaseHistory: [],
      creditsError: null,
      historyError: null,
    });
    mockBuyPack.mockResolvedValue({ ok: true, availableCredits: 3 });
  });

  it("affiche une erreur métier quand le solde est indisponible", async () => {
    mockGetCreditsSummarySafe.mockResolvedValue({
      availableCredits: null,
      purchaseHistory: [],
      creditsError: "Impossible de charger le solde de crédits pour le moment.",
      historyError: null,
    });

    render(<PacksPage />);

    expect(
      await screen.findByText("Impossible de charger le solde de crédits pour le moment."),
    ).toBeInTheDocument();
    expect(screen.queryByText(/server components render/i)).not.toBeInTheDocument();
  });

  it("affiche une erreur typée quand l'ajout du pack échoue", async () => {
    const user = userEvent.setup();
    mockBuyPack.mockResolvedValue({
      error: "Impossible d'ajouter ce pack pour le moment.",
    });

    render(<PacksPage />);

    await waitFor(() => {
      expect(mockGetCreditsSummarySafe).toHaveBeenCalled();
    });

    await user.click(screen.getAllByRole("button", { name: /choisir ce pack/i })[0]!);

    await waitFor(() => {
      expect(mockBuyPack).toHaveBeenCalled();
    });
  });
});

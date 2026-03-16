import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ApplyMissionModal } from "@/components/modals/ApplyMissionModal";

const mockCloseApplyModal = vi.fn();
const mockRefresh = vi.fn();
const mockToastSuccess = vi.fn();
const mockToastError = vi.fn();
const mockToastInfo = vi.fn();
const mockApplyToMission = vi.fn();

vi.mock("@/lib/stores/useUIStore", () => ({
  useUIStore: (selector: (s: {
    isApplyModalOpen: boolean;
    applyMissionId: string | null;
    closeApplyModal: () => void;
  }) => unknown) =>
    selector({
      isApplyModalOpen: true,
      applyMissionId: "mission-xyz",
      closeApplyModal: mockCloseApplyModal,
    }),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: mockRefresh }),
}));

vi.mock("sonner", () => ({
  toast: {
    success: (...args: unknown[]) => mockToastSuccess(...args),
    error: (...args: unknown[]) => mockToastError(...args),
    info: (...args: unknown[]) => mockToastInfo(...args),
  },
}));

vi.mock("@/app/actions/missions", () => ({
  applyToMission: (...args: unknown[]) => mockApplyToMission(...args),
}));

describe("ApplyMissionModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockApplyToMission.mockResolvedValue({ ok: true });
  });

  it("affiche le titre du modal", () => {
    render(<ApplyMissionModal />);
    expect(screen.getByText(/postuler à cette mission/i)).toBeInTheDocument();
  });

  it("affiche le champ de motivation et le slider de taux", () => {
    render(<ApplyMissionModal />);
    expect(screen.getByLabelText(/lettre de motivation/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/taux horaire proposé/i)).toBeInTheDocument();
  });

  it("soumission réussie: appelle applyToMission, toast.success et router.refresh", async () => {
    render(<ApplyMissionModal />);

    fireEvent.change(screen.getByLabelText(/lettre de motivation/i), {
      target: { value: "Je suis très motivé pour cette mission de renfort." },
    });

    fireEvent.click(screen.getByRole("button", { name: /envoyer/i }));

    await waitFor(() => {
      expect(mockApplyToMission).toHaveBeenCalledWith(
        "mission-xyz",
        expect.objectContaining({ motivation: expect.any(String) }),
      );
      expect(mockToastSuccess).toHaveBeenCalled();
      expect(mockRefresh).toHaveBeenCalled();
    });
  });

  it("déjà postulé: affiche toast.info et ferme le modal", async () => {
    mockApplyToMission.mockResolvedValue({
      ok: false,
      error: "Vous avez déjà postulé à cette mission.",
    });

    render(<ApplyMissionModal />);
    fireEvent.change(screen.getByLabelText(/lettre de motivation/i), {
      target: { value: "Une motivation de plus de vingt caractères ici." },
    });
    fireEvent.click(screen.getByRole("button", { name: /envoyer/i }));

    await waitFor(() => {
      expect(mockToastInfo).toHaveBeenCalled();
      expect(mockCloseApplyModal).toHaveBeenCalled();
    });
  });

  it("erreur générique: affiche toast.error", async () => {
    mockApplyToMission.mockResolvedValue({
      ok: false,
      error: "Erreur réseau",
    });

    render(<ApplyMissionModal />);
    fireEvent.change(screen.getByLabelText(/lettre de motivation/i), {
      target: { value: "Une motivation de plus de vingt caractères ici." },
    });
    fireEvent.click(screen.getByRole("button", { name: /envoyer/i }));

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalled();
    });
  });
});

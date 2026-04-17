import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MissionApplyButton } from "@/components/marketplace/MissionApplyButton";

const mockApplyToMission = vi.fn();
const mockRefresh = vi.fn();
const mockToastSuccess = vi.fn();
const mockToastInfo = vi.fn();
const mockToastError = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: mockRefresh }),
}));

vi.mock("sonner", () => ({
  toast: {
    success: (...args: unknown[]) => mockToastSuccess(...args),
    info: (...args: unknown[]) => mockToastInfo(...args),
    error: (...args: unknown[]) => mockToastError(...args),
  },
}));

vi.mock("@/app/actions/missions", () => ({
  applyToMission: (...args: unknown[]) => mockApplyToMission(...args),
}));

describe("MissionApplyButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("affiche le bouton 'Postuler à cette mission'", () => {
    render(<MissionApplyButton missionId="m-1" />);
    expect(
      screen.getByRole("button", { name: /postuler à cette mission/i }),
    ).toBeInTheDocument();
  });

  it("envoie la candidature directement au clic (sans modale)", async () => {
    mockApplyToMission.mockResolvedValue({ ok: true });
    render(<MissionApplyButton missionId="m-42" />);

    fireEvent.click(screen.getByRole("button", { name: /postuler/i }));

    await waitFor(() => {
      expect(mockApplyToMission).toHaveBeenCalledWith("m-42");
      expect(mockToastSuccess).toHaveBeenCalled();
      expect(mockRefresh).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /candidature envoyée/i }),
      ).toBeDisabled();
    });
  });

  it("affiche un message si l'utilisateur a déjà postulé", async () => {
    mockApplyToMission.mockResolvedValue({
      ok: false,
      error: "Vous avez déjà postulé à cette mission.",
    });
    render(<MissionApplyButton missionId="m-7" />);

    fireEvent.click(screen.getByRole("button", { name: /postuler/i }));

    await waitFor(() => {
      expect(mockToastInfo).toHaveBeenCalled();
    });
    expect(mockToastError).not.toHaveBeenCalled();
  });

  it("affiche une erreur en cas d'échec réseau", async () => {
    mockApplyToMission.mockResolvedValue({
      ok: false,
      error: "Erreur serveur",
    });
    render(<MissionApplyButton missionId="m-9" />);

    fireEvent.click(screen.getByRole("button", { name: /postuler/i }));

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalled();
    });
  });

  it("accepte une className custom", () => {
    render(<MissionApplyButton missionId="m-1" className="custom-class" />);
    const btn = screen.getByRole("button");
    expect(btn.className).toContain("custom-class");
  });
});

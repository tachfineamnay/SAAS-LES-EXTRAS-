import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MissionApplyButton } from "@/components/marketplace/MissionApplyButton";

const mockOpenApplyModal = vi.fn();

vi.mock("@/lib/stores/useUIStore", () => ({
  useUIStore: (selector: (s: { openApplyModal: (id: string) => void }) => unknown) =>
    selector({ openApplyModal: mockOpenApplyModal }),
}));

describe("MissionApplyButton", () => {
  it("affiche le bouton 'Postuler à cette mission'", () => {
    render(<MissionApplyButton missionId="m-1" />);
    expect(screen.getByRole("button", { name: /postuler à cette mission/i })).toBeInTheDocument();
  });

  it("appelle openApplyModal avec le missionId au clic", () => {
    render(<MissionApplyButton missionId="m-42" />);
    fireEvent.click(screen.getByRole("button", { name: /postuler/i }));
    expect(mockOpenApplyModal).toHaveBeenCalledWith("m-42");
  });

  it("accepte une className custom", () => {
    render(<MissionApplyButton missionId="m-1" className="custom-class" />);
    const btn = screen.getByRole("button");
    expect(btn.className).toContain("custom-class");
  });
});

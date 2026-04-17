import { describe, it, expect, vi, beforeEach } from "vitest";

const mockApiRequest = vi.fn();
const mockGetSession = vi.fn().mockResolvedValue({ token: "tok" });

vi.mock("@/lib/api", () => ({
  apiRequest: (...args: unknown[]) => mockApiRequest(...args),
}));
vi.mock("@/lib/session", () => ({
  getSession: () => mockGetSession(),
}));
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

const { requestMissionInfo } = await import("@/app/actions/missions");

describe("requestMissionInfo", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetSession.mockResolvedValue({ token: "tok" });
    mockApiRequest.mockResolvedValue({ ok: true });
  });

  it("envoie POST /missions/:id/info-request avec le message", async () => {
    await requestMissionInfo("mission-1", "Pouvez-vous préciser le public ?");
    expect(mockApiRequest).toHaveBeenCalledWith(
      "/missions/mission-1/info-request",
      expect.objectContaining({
        method: "POST",
        body: { message: "Pouvez-vous préciser le public ?" },
      }),
    );
  });

  it("retourne { ok: true } en cas de succès", async () => {
    const result = await requestMissionInfo("m-1", "Question précise et suffisamment longue.");
    expect(result).toEqual({ ok: true });
  });

  it("retourne { ok: false } si la session est absente", async () => {
    mockGetSession.mockResolvedValue(null);
    const result = await requestMissionInfo("m-1", "Question précise.");
    expect(result.ok).toBe(false);
    expect(result.error).toBeTruthy();
  });

  it("remonte le message d'erreur en cas d'échec API", async () => {
    mockApiRequest.mockRejectedValue(new Error("Mission not found"));
    const result = await requestMissionInfo("m-999", "Question précise.");
    expect(result.ok).toBe(false);
    expect(result.error).toBe("Mission not found");
  });
});

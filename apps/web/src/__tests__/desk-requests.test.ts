import { describe, it, expect, vi, beforeEach } from "vitest";

const mockApiRequest = vi.fn();
const mockGetSession = vi.fn();
const mockGetAdminSessionToken = vi.fn().mockResolvedValue("admin-tok");
const mockRevalidatePath = vi.fn();

vi.mock("@/lib/api", () => ({
  apiRequest: (...args: unknown[]) => mockApiRequest(...args),
}));
vi.mock("@/lib/session", () => ({
  getSession: () => mockGetSession(),
}));
vi.mock("@/app/actions/_shared/admin-session", () => ({
  getAdminSessionToken: () => mockGetAdminSessionToken(),
}));
vi.mock("next/cache", () => ({
  revalidatePath: (...args: unknown[]) => mockRevalidatePath(...args),
}));

const { getDeskRequests, updateDeskRequestStatus, respondToDeskRequest } =
  await import("@/app/actions/admin");
const { getMyDeskRequests } = await import("@/app/actions/desk");

const fakeDeskRequest = {
  id: "dr-1",
  type: "MISSION_INFO_REQUEST",
  status: "OPEN",
  message: "Question sur le public accueilli",
  response: null,
  answeredAt: null,
  createdAt: new Date().toISOString(),
  mission: { id: "m-1", title: "Infirmier urgences" },
  requester: {
    id: "u-1",
    email: "karim@test.fr",
    profile: { firstName: "Karim", lastName: "Bensalem" },
  },
  answeredBy: null,
};

// ─────────────────────────────────────────────
// Admin — getDeskRequests
// ─────────────────────────────────────────────

describe("getDeskRequests (admin)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetAdminSessionToken.mockResolvedValue("admin-tok");
    mockApiRequest.mockResolvedValue([fakeDeskRequest]);
  });

  it("appelle GET /admin/desk-requests avec le token admin", async () => {
    await getDeskRequests();
    expect(mockApiRequest).toHaveBeenCalledWith(
      "/admin/desk-requests",
      expect.objectContaining({ method: "GET", token: "admin-tok" }),
    );
  });

  it("retourne la liste des demandes", async () => {
    const result = await getDeskRequests();
    expect(result).toHaveLength(1);
    const first = result[0]!;
    expect(first.id).toBe("dr-1");
    expect(first.mission.title).toBe("Infirmier urgences");
    expect(first.requester.email).toBe("karim@test.fr");
  });

  it("retourne un tableau vide si l'API échoue", async () => {
    mockApiRequest.mockRejectedValue(new Error("Unauthorized"));
    const result = await getDeskRequests();
    expect(result).toEqual([]);
  });
});

// ─────────────────────────────────────────────
// Admin — updateDeskRequestStatus
// ─────────────────────────────────────────────

describe("updateDeskRequestStatus (admin)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetAdminSessionToken.mockResolvedValue("admin-tok");
    mockApiRequest.mockResolvedValue({});
  });

  it("appelle PATCH /admin/desk-requests/:id/status avec le bon statut", async () => {
    await updateDeskRequestStatus("dr-1", "IN_PROGRESS");
    expect(mockApiRequest).toHaveBeenCalledWith(
      "/admin/desk-requests/dr-1/status",
      expect.objectContaining({
        method: "PATCH",
        body: { status: "IN_PROGRESS" },
        token: "admin-tok",
      }),
    );
  });

  it("revalide la page /admin/demandes", async () => {
    await updateDeskRequestStatus("dr-1", "CLOSED");
    expect(mockRevalidatePath).toHaveBeenCalledWith("/admin/demandes");
  });
});

// ─────────────────────────────────────────────
// Admin — respondToDeskRequest
// ─────────────────────────────────────────────

describe("respondToDeskRequest (admin)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetAdminSessionToken.mockResolvedValue("admin-tok");
    mockApiRequest.mockResolvedValue({});
  });

  it("appelle PATCH /admin/desk-requests/:id/respond avec la réponse", async () => {
    await respondToDeskRequest("dr-1", "Le public est composé d'adultes en situation de handicap.");
    expect(mockApiRequest).toHaveBeenCalledWith(
      "/admin/desk-requests/dr-1/respond",
      expect.objectContaining({
        method: "PATCH",
        body: { response: "Le public est composé d'adultes en situation de handicap." },
        token: "admin-tok",
      }),
    );
  });

  it("revalide la page /admin/demandes après réponse", async () => {
    await respondToDeskRequest("dr-1", "Réponse complète.");
    expect(mockRevalidatePath).toHaveBeenCalledWith("/admin/demandes");
  });
});

// ─────────────────────────────────────────────
// Candidat — getMyDeskRequests
// ─────────────────────────────────────────────

describe("getMyDeskRequests (freelance)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetAdminSessionToken.mockResolvedValue("admin-tok");
    mockGetSession.mockResolvedValue({ token: "freelance-tok", user: { id: "u-1", role: "FREELANCE" } });
    mockApiRequest.mockResolvedValue([fakeDeskRequest]);
  });

  it("appelle GET /desk-requests/mine avec le token du candidat", async () => {
    await getMyDeskRequests();
    expect(mockApiRequest).toHaveBeenCalledWith(
      "/desk-requests/mine",
      expect.objectContaining({ method: "GET", token: "freelance-tok" }),
    );
  });

  it("retourne uniquement les demandes du candidat connecté", async () => {
    const result = await getMyDeskRequests();
    expect(result).toHaveLength(1);
    expect(result[0]!.mission.title).toBe("Infirmier urgences");
  });

  it("retourne un tableau vide si pas de session", async () => {
    mockGetSession.mockResolvedValue(null);
    const result = await getMyDeskRequests();
    expect(result).toEqual([]);
  });

  it("retourne un tableau vide si l'API échoue", async () => {
    mockApiRequest.mockRejectedValue(new Error("Forbidden"));
    const result = await getMyDeskRequests();
    expect(result).toEqual([]);
  });
});

// ─────────────────────────────────────────────
// Non-régression — flux Postuler
// ─────────────────────────────────────────────

describe("non-régression flux applyToMission", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetAdminSessionToken.mockResolvedValue("admin-tok");
    mockGetSession.mockResolvedValue({ token: "tok" });
    mockApiRequest.mockResolvedValue({});
  });

  it("appelle POST /missions/:id/apply — flux séparé de la demande info", async () => {
    const { applyToMission } = await import("@/app/actions/missions");
    await applyToMission("m-1", { motivation: "Motivé", proposedRate: 25 });
    const calls: string[] = mockApiRequest.mock.calls.map((c: unknown[]) => c[0] as string);
    expect(calls).toContain("/missions/m-1/apply");
    expect(calls).not.toContain("/missions/m-1/info-request");
  });
});

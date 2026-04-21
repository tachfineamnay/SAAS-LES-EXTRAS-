import { describe, it, expect, vi, beforeEach } from "vitest";

const mockApiRequest = vi.fn();
const mockSafeApiRequest = vi.fn();
const mockGetSession = vi.fn();
const mockGetAdminSessionToken = vi.fn().mockResolvedValue("admin-tok");
const mockRevalidatePath = vi.fn();

vi.mock("@/lib/api", () => ({
  apiRequest: (...args: unknown[]) => mockApiRequest(...args),
  safeApiRequest: (...args: unknown[]) => mockSafeApiRequest(...args),
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

const {
  assignDeskRequest,
  featureService,
  getAdminOverview,
  getDeskRequests,
  hideService,
  respondToDeskRequest,
  updateDeskRequestStatus,
} =
  await import("@/app/actions/admin");
const { getMyDeskRequests } = await import("@/app/actions/desk");

const fakeDeskRequest = {
  id: "dr-1",
  type: "MISSION_INFO_REQUEST",
  priority: "NORMAL",
  status: "OPEN",
  assignedToAdminId: null,
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
  assignedToAdmin: null,
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
// Admin — getAdminOverview
// ─────────────────────────────────────────────

describe("getAdminOverview (admin)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetAdminSessionToken.mockResolvedValue("admin-tok");
    mockApiRequest.mockResolvedValue({
      pendingUsersCount: 1,
      openDeskRequestsCount: 2,
      urgentOpenMissionsCount: 3,
      featuredServicesCount: 4,
      hiddenServicesCount: 5,
      pendingInvoicesCount: 6,
    });
  });

  it("appelle GET /admin/overview avec le token admin", async () => {
    await getAdminOverview();
    expect(mockApiRequest).toHaveBeenCalledWith(
      "/admin/overview",
      expect.objectContaining({ method: "GET", token: "admin-tok" }),
    );
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
// Admin — assignDeskRequest
// ─────────────────────────────────────────────

describe("assignDeskRequest (admin)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetAdminSessionToken.mockResolvedValue("admin-tok");
    mockApiRequest.mockResolvedValue({});
  });

  it("appelle PATCH /admin/desk-requests/:id/assign avec l'admin choisi", async () => {
    await assignDeskRequest("dr-1", "admin-2");
    expect(mockApiRequest).toHaveBeenCalledWith(
      "/admin/desk-requests/dr-1/assign",
      expect.objectContaining({
        method: "PATCH",
        body: { adminId: "admin-2" },
        token: "admin-tok",
      }),
    );
  });

  it("permet de retirer l'assignation", async () => {
    await assignDeskRequest("dr-1", null);
    expect(mockApiRequest).toHaveBeenCalledWith(
      "/admin/desk-requests/dr-1/assign",
      expect.objectContaining({
        body: { adminId: null },
      }),
    );
  });
});

// ─────────────────────────────────────────────
// Admin — services moderation
// ─────────────────────────────────────────────

describe("moderation services (admin)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetAdminSessionToken.mockResolvedValue("admin-tok");
    mockApiRequest.mockResolvedValue({});
  });

  it("appelle l'endpoint de mise en avant et revalide les pages utiles", async () => {
    await featureService("svc-1");
    expect(mockApiRequest).toHaveBeenCalledWith(
      "/admin/services/svc-1/feature",
      expect.objectContaining({ method: "POST", token: "admin-tok" }),
    );
    expect(mockRevalidatePath).toHaveBeenCalledWith("/admin/services");
    expect(mockRevalidatePath).toHaveBeenCalledWith("/admin");
    expect(mockRevalidatePath).toHaveBeenCalledWith("/marketplace");
  });

  it("appelle l'endpoint de masquage et revalide les pages utiles", async () => {
    await hideService("svc-1");
    expect(mockApiRequest).toHaveBeenCalledWith(
      "/admin/services/svc-1/hide",
      expect.objectContaining({ method: "POST", token: "admin-tok" }),
    );
    expect(mockRevalidatePath).toHaveBeenCalledWith("/admin/services");
    expect(mockRevalidatePath).toHaveBeenCalledWith("/admin");
    expect(mockRevalidatePath).toHaveBeenCalledWith("/marketplace");
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

  it("utilise le token fourni sans relire la session", async () => {
    await getMyDeskRequests("direct-freelance-tok");
    expect(mockGetSession).not.toHaveBeenCalled();
    expect(mockApiRequest).toHaveBeenCalledWith(
      "/desk-requests/mine",
      expect.objectContaining({ method: "GET", token: "direct-freelance-tok" }),
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

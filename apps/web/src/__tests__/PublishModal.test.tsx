import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import type { HTMLAttributes, ReactNode } from "react";
import { PublishModal } from "@/components/modals/PublishModal";

const mockOpenPublishModal = vi.fn();
const mockClosePublishModal = vi.fn();
const mockCreateServiceFromPublish = vi.fn();
const mockPush = vi.fn();
const mockRefresh = vi.fn();

vi.mock("@/lib/stores/useUIStore", () => ({
  useUIStore: (selector: (s: {
    isPublishModalOpen: boolean;
    openPublishModal: () => void;
    closePublishModal: () => void;
  }) => unknown) =>
    selector({
      isPublishModalOpen: true,
      openPublishModal: mockOpenPublishModal,
      closePublishModal: mockClosePublishModal,
    }),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, refresh: mockRefresh }),
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("@/app/actions/marketplace", () => ({
  createServiceFromPublish: (...args: unknown[]) => mockCreateServiceFromPublish(...args),
}));

vi.mock("framer-motion", () => ({
  AnimatePresence: ({ children }: { children: ReactNode }) => <>{children}</>,
  motion: {
    div: ({ children, ...props }: HTMLAttributes<HTMLDivElement>) => <div {...props}>{children}</div>,
  },
}));

async function advanceToPricing() {
  fireEvent.click(screen.getByRole("button", { name: /gestion des émotions/i }));
  fireEvent.click(screen.getByRole("button", { name: /suivant/i }));

  fireEvent.change(await screen.findByLabelText(/titre de/i), {
    target: { value: "Atelier gestion des émotions" },
  });
  fireEvent.change(screen.getByLabelText(/description générale/i), {
    target: { value: "Une description suffisamment détaillée pour valider le formulaire." },
  });
  fireEvent.click(screen.getByRole("button", { name: /suivant/i }));

  await waitFor(() => {
    expect(screen.getByText(/ces sections sont optionnelles/i)).toBeInTheDocument();
  });
  fireEvent.click(screen.getByRole("button", { name: /suivant/i }));

  await waitFor(() => {
    expect(screen.getByText(/public cible/i)).toBeInTheDocument();
  });
  fireEvent.click(screen.getByRole("button", { name: /^adultes$/i }));
  fireEvent.click(screen.getByRole("button", { name: /suivant/i }));

  await waitFor(() => {
    expect(screen.getByText(/forfait séance/i)).toBeInTheDocument();
  });
}

async function advanceToSchedule(container: HTMLElement) {
  await advanceToPricing();

  fireEvent.change(screen.getByLabelText(/tarif forfaitaire/i), {
    target: { value: "350" },
  });
  fireEvent.click(screen.getByRole("button", { name: /suivant/i }));

  await waitFor(() => {
    expect(screen.getByText(/mode de planification/i)).toBeInTheDocument();
  });

  const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);
  const slotDateInput = container.querySelector('input[name="slots.0.date"]') as HTMLInputElement;
  const slotStartInput = container.querySelector('input[name="slots.0.heureDebut"]') as HTMLInputElement;
  const slotEndInput = container.querySelector('input[name="slots.0.heureFin"]') as HTMLInputElement;

  fireEvent.change(slotDateInput, { target: { value: futureDate } });
  fireEvent.change(slotStartInput, { target: { value: "11:00" } });
  fireEvent.change(slotEndInput, { target: { value: "09:00" } });
}

describe("PublishModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCreateServiceFromPublish.mockResolvedValue({ ok: true });
  });

  it("bloque l'étape tarif avec un message visible si le tarif par participant manque", async () => {
    render(<PublishModal />);

    await advanceToPricing();

    fireEvent.click(screen.getByRole("button", { name: /par participant/i }));
    fireEvent.click(screen.getByRole("button", { name: /suivant/i }));

    await waitFor(() => {
      expect(screen.getByText("Veuillez saisir un tarif par participant")).toBeInTheDocument();
    });
    expect(mockCreateServiceFromPublish).not.toHaveBeenCalled();
  });

  it("bloque la publication avec un message visible si un créneau est invalide", async () => {
    const { container } = render(<PublishModal />);

    await advanceToSchedule(container);

    fireEvent.click(screen.getByRole("button", { name: /publier l'atelier/i }));

    await waitFor(() => {
      expect(screen.getByText("L'heure de fin doit être après l'heure de début")).toBeInTheDocument();
    });
    expect(mockCreateServiceFromPublish).not.toHaveBeenCalled();
  });
});

import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { RenfortModal } from "@/components/modals/RenfortModal";
import { useUIStore } from "@/lib/stores/useUIStore";

const mockPush = vi.fn();
const mockRefresh = vi.fn();
const mockToastSuccess = vi.fn();
const mockToastError = vi.fn();
const mockCreateMissionFromRenfort = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, refresh: mockRefresh }),
}));

vi.mock("sonner", () => ({
  toast: {
    success: (...args: unknown[]) => mockToastSuccess(...args),
    error: (...args: unknown[]) => mockToastError(...args),
  },
}));

vi.mock("framer-motion", () => ({
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  motion: {
    div: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => <div {...props}>{children}</div>,
  },
}));

vi.mock("@/components/ui/dialog", () => ({
  Dialog: ({ open, children }: { open: boolean; children: React.ReactNode }) => (open ? <div>{children}</div> : null),
  DialogContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogTitle: ({ children }: { children: React.ReactNode }) => <h1>{children}</h1>,
  DialogDescription: ({ children }: { children: React.ReactNode }) => <p>{children}</p>,
}));

vi.mock("@/components/ui/switch", () => ({
  Switch: ({
    checked,
    onCheckedChange,
  }: {
    checked: boolean;
    onCheckedChange?: (checked: boolean) => void;
  }) => (
    <button type="button" onClick={() => onCheckedChange?.(!checked)}>
      {checked ? "On" : "Off"}
    </button>
  ),
}));

vi.mock("@/components/ui/select", async () => {
  const ReactModule = await import("react");
  const SelectContext = ReactModule.createContext<{
    value?: string;
    onValueChange?: (value: string) => void;
  }>({});

  return {
    Select: ({
      value,
      onValueChange,
      children,
    }: {
      value?: string;
      onValueChange?: (value: string) => void;
      children: React.ReactNode;
    }) => (
      <SelectContext.Provider value={{ value, onValueChange }}>
        <div>{children}</div>
      </SelectContext.Provider>
    ),
    SelectTrigger: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    SelectValue: ({ placeholder }: { placeholder?: string }) => {
      const context = ReactModule.useContext(SelectContext);
      return <span>{context.value ?? placeholder ?? ""}</span>;
    },
    SelectContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    SelectItem: ({ value, children }: { value: string; children: React.ReactNode }) => {
      const context = ReactModule.useContext(SelectContext);
      return (
        <button type="button" onClick={() => context.onValueChange?.(value)}>
          {children}
        </button>
      );
    },
  };
});

vi.mock("@/app/actions/marketplace", () => ({
  createMissionFromRenfort: (...args: unknown[]) => mockCreateMissionFromRenfort(...args),
}));

vi.mock("@/lib/stores/useUIStore", async () => {
  const { create } = await import("zustand");

  type MockState = {
    isRenfortModalOpen: boolean;
    renfortStep: number;
    renfortStepDir: number;
    openRenfortModal: () => void;
    closeRenfortModal: () => void;
    setRenfortStep: (step: number) => void;
    setRenfortStepDir: (dir: number) => void;
  };

  const useUIStore = create<MockState>((set) => ({
    isRenfortModalOpen: true,
    renfortStep: 0,
    renfortStepDir: 1,
    openRenfortModal: () => set({ isRenfortModalOpen: true }),
    closeRenfortModal: () => set({ isRenfortModalOpen: false, renfortStep: 0 }),
    setRenfortStep: (step) => set({ renfortStep: step }),
    setRenfortStepDir: (dir) => set({ renfortStepDir: dir }),
  }));

  return { useUIStore };
});

function resetStore() {
  useUIStore.setState({
    isRenfortModalOpen: true,
    renfortStep: 0,
    renfortStepDir: 1,
  });
}

function addDaysFromNow(offset: number): Date {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() + offset);
  return date;
}

function toInputDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

async function reachPlanningStep() {
  fireEvent.click(screen.getByRole("button", { name: /aide-soignant/i }));
  fireEvent.click(screen.getByRole("button", { name: /suivant/i }));

  await waitFor(() => {
    expect(screen.getByText(/type d'établissement/i)).toBeInTheDocument();
  });

  fireEvent.click(screen.getByRole("button", { name: "EHPAD" }));
  fireEvent.click(screen.getByRole("button", { name: /personnes âgées/i }));
  fireEvent.click(screen.getByRole("button", { name: /suivant/i }));

  await waitFor(() => {
    expect(screen.getByText(/chaque créneau avec sa date/i)).toBeInTheDocument();
  });
}

function fillPlanningSlot(
  container: HTMLElement,
  slotIndex: number,
  values: { date: string; heureDebut: string; heureFin: string },
) {
  const dateInputs = container.querySelectorAll<HTMLInputElement>('input[type="date"]');
  const timeInputs = container.querySelectorAll<HTMLInputElement>('input[type="time"]');

  fireEvent.change(dateInputs[slotIndex]!, { target: { value: values.date } });
  fireEvent.change(timeInputs[slotIndex * 2]!, { target: { value: values.heureDebut } });
  fireEvent.change(timeInputs[slotIndex * 2 + 1]!, { target: { value: values.heureFin } });
}

async function reachRecapStep(container: HTMLElement) {
  fireEvent.click(screen.getByRole("button", { name: /suivant/i }));
  await waitFor(() => {
    expect(screen.getByText(/type de poste/i)).toBeInTheDocument();
  });

  fireEvent.click(screen.getByRole("button", { name: /suivant/i }));
  await waitFor(() => {
    expect(screen.getByLabelText(/adresse complète/i)).toBeInTheDocument();
  });

  fireEvent.change(screen.getByLabelText(/adresse complète/i), {
    target: { value: "12 rue des Lilas" },
  });
  fireEvent.change(screen.getByLabelText(/code postal/i), {
    target: { value: "69003" },
  });
  fireEvent.change(screen.getByLabelText(/ville/i), {
    target: { value: "Lyon" },
  });
  fireEvent.click(screen.getByRole("button", { name: /suivant/i }));

  await waitFor(() => {
    expect(screen.getByText(/vérifiez les informations/i)).toBeInTheDocument();
  });

  return container.textContent ?? "";
}

describe("RenfortModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetStore();
    mockCreateMissionFromRenfort.mockResolvedValue({ ok: true });
  });

  it("bloque un créneau déjà passé", async () => {
    const { container } = render(<RenfortModal />);
    await reachPlanningStep();

    fillPlanningSlot(container, 0, {
      date: toInputDate(addDaysFromNow(-1)),
      heureDebut: "08:00",
      heureFin: "12:00",
    });

    fireEvent.click(screen.getByRole("button", { name: /suivant/i }));

    await waitFor(() => {
      expect(screen.getByText(/déjà passé/i)).toBeInTheDocument();
    });
    expect(useUIStore.getState().renfortStep).toBe(2);
  });

  it("bloque des créneaux qui se chevauchent", async () => {
    const { container } = render(<RenfortModal />);
    await reachPlanningStep();

    fillPlanningSlot(container, 0, {
      date: toInputDate(addDaysFromNow(10)),
      heureDebut: "08:00",
      heureFin: "12:00",
    });

    fireEvent.click(screen.getByRole("button", { name: /ajouter un créneau/i }));
    fillPlanningSlot(container, 1, {
      date: toInputDate(addDaysFromNow(10)),
      heureDebut: "11:00",
      heureFin: "14:00",
    });

    fireEvent.click(screen.getByRole("button", { name: /suivant/i }));

    await waitFor(() => {
      expect(screen.getByText(/chevauche un autre créneau/i)).toBeInTheDocument();
    });
    expect(useUIStore.getState().renfortStep).toBe(2);
  });

  it("trie les créneaux dans le récapitulatif et à l'envoi", async () => {
    const { container } = render(<RenfortModal />);
    await reachPlanningStep();
    const laterDay = addDaysFromNow(12);
    const earlierDay = addDaysFromNow(10);

    fillPlanningSlot(container, 0, {
      date: toInputDate(laterDay),
      heureDebut: "14:00",
      heureFin: "18:00",
    });

    fireEvent.click(screen.getByRole("button", { name: /ajouter un créneau/i }));
    fillPlanningSlot(container, 1, {
      date: toInputDate(earlierDay),
      heureDebut: "08:00",
      heureFin: "12:00",
    });

    const recapText = await reachRecapStep(container);

    const earlierLabel = format(new Date(`${toInputDate(earlierDay)}T08:00`), "d MMM yyyy", { locale: fr });
    const laterLabel = format(new Date(`${toInputDate(laterDay)}T14:00`), "d MMM yyyy", { locale: fr });

    expect(recapText.indexOf(earlierLabel)).toBeLessThan(recapText.indexOf(laterLabel));

    fireEvent.click(screen.getByRole("button", { name: /publier le sos/i }));

    await waitFor(() => {
      expect(mockCreateMissionFromRenfort).toHaveBeenCalledWith(
        expect.objectContaining({
          slots: [
            { date: toInputDate(earlierDay), heureDebut: "08:00", heureFin: "12:00" },
            { date: toInputDate(laterDay), heureDebut: "14:00", heureFin: "18:00" },
          ],
          dateStart: new Date(`${toInputDate(earlierDay)}T08:00`).toISOString(),
          dateEnd: new Date(`${toInputDate(laterDay)}T18:00`).toISOString(),
        }),
      );
      expect(mockPush).toHaveBeenCalledWith("/dashboard/renforts");
      expect(mockRefresh).toHaveBeenCalled();
    });
  });
});

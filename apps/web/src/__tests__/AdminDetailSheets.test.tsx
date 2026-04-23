import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/link", () => ({
  default: ({ href, children }: { href: string; children: any }) => (
    <a href={href}>{children}</a>
  ),
}));

vi.mock("@/components/ui/sheet", () => ({
  Sheet: ({ children }: { children: any }) => <div>{children}</div>,
  SheetContent: ({ children }: { children: any }) => <div>{children}</div>,
  SheetHeader: ({ children }: { children: any }) => <div>{children}</div>,
  SheetTitle: ({ children }: { children: any }) => <h2>{children}</h2>,
  SheetDescription: ({ children }: { children: any }) => <p>{children}</p>,
}));

const { MissionDetailSheet } = await import("@/components/admin/MissionDetailSheet");
const { ServiceDetailSheet } = await import("@/components/admin/ServiceDetailSheet");

describe("MissionDetailSheet", () => {
  it("affiche les demandes liées et déclenche la suppression rapide", () => {
    const onDelete = vi.fn();

    render(
      <MissionDetailSheet
        open
        onOpenChange={() => undefined}
        isLoading={false}
        isPending={false}
        onDelete={onDelete}
        mission={{
          id: "mission-1",
          title: "Mission de nuit",
          status: "OPEN",
          establishmentName: "Luc Martin",
          establishmentEmail: "est@test.fr",
          address: "12 rue des Lilas",
          dateStart: "2026-04-20T08:00:00.000Z",
          dateEnd: "2026-04-20T16:00:00.000Z",
          hourlyRate: 28,
          candidatesCount: 2,
          linkedDeskRequests: [
            {
              id: "desk-1",
              status: "OPEN",
              priority: "HIGH",
              createdAt: "2026-04-18T10:00:00.000Z",
              messageExcerpt: "Question sur les transmissions.",
            },
          ],
        }}
      />,
    );

    expect(screen.getByText("Mission de nuit")).toBeInTheDocument();
    expect(screen.getByText("Question sur les transmissions.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /voir les demandes liées/i })).toHaveAttribute(
      "href",
      "/admin/demandes",
    );

    fireEvent.click(screen.getByRole("button", { name: /supprimer la mission/i }));
    expect(onDelete).toHaveBeenCalledWith("mission-1");
  });
});

describe("ServiceDetailSheet", () => {
  it("affiche le détail du service et déclenche les actions rapides", () => {
    const onToggleFeature = vi.fn();
    const onToggleHide = vi.fn();

    render(
      <ServiceDetailSheet
        open
        onOpenChange={() => undefined}
        isLoading={false}
        isPending={false}
        onToggleFeature={onToggleFeature}
        onToggleHide={onToggleHide}
        service={{
          id: "service-1",
          title: "Atelier mémoire",
          type: "WORKSHOP",
          price: 140,
          freelanceName: "Nora Diallo",
          freelanceEmail: "nora@test.fr",
          isFeatured: false,
          isHidden: true,
          description: "Travail en petit groupe.",
          createdAt: "2026-04-10T08:00:00.000Z",
        }}
      />,
    );

    expect(screen.getByText("Atelier mémoire")).toBeInTheDocument();
    expect(screen.getByText("Travail en petit groupe.")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /mettre en avant/i }));
    fireEvent.click(screen.getByRole("button", { name: /afficher/i }));

    expect(onToggleFeature).toHaveBeenCalledWith("service-1");
    expect(onToggleHide).toHaveBeenCalledWith("service-1");
  });
});

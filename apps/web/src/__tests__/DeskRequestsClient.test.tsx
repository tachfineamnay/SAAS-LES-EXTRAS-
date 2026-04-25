import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import type { MyDeskRequest } from "@/app/actions/desk";

const { DeskRequestsClient } = await import("@/app/(dashboard)/dashboard/demandes/DeskRequestsClient");

const baseRequest = {
  type: "TECHNICAL_ISSUE",
  response: null,
  answeredAt: null,
  createdAt: "2026-04-18T10:00:00.000Z",
  mission: null,
  booking: null,
  answeredBy: null,
} satisfies Omit<MyDeskRequest, "id" | "status" | "message">;

describe("DeskRequestsClient", () => {
  it("filtre les demandes par statut", () => {
    const requests: MyDeskRequest[] = [
      {
        ...baseRequest,
        id: "open-1",
        status: "OPEN",
        message: "Demande encore ouverte",
      },
      {
        ...baseRequest,
        id: "answered-1",
        status: "ANSWERED",
        message: "Demande déjà répondue",
        response: "Réponse transmise par le Desk.",
        answeredAt: "2026-04-18T12:00:00.000Z",
      },
    ];

    render(<DeskRequestsClient requests={requests} />);

    expect(screen.getByText("Demande encore ouverte")).toBeInTheDocument();
    expect(screen.getByText("Demande déjà répondue")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /répondues/i }));

    expect(screen.queryByText("Demande encore ouverte")).not.toBeInTheDocument();
    expect(screen.getByText("Demande déjà répondue")).toBeInTheDocument();
    expect(screen.getByText("Réponse transmise par le Desk.")).toBeInTheDocument();
  });

  it("affiche un état vide quand le filtre ne contient aucune demande", () => {
    render(
      <DeskRequestsClient
        requests={[
          {
            ...baseRequest,
            id: "open-1",
            status: "OPEN",
            message: "Demande encore ouverte",
          },
        ]}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /clôturées/i }));

    expect(screen.getByText("Aucune demande dans ce statut")).toBeInTheDocument();
    expect(screen.queryByText("Demande encore ouverte")).not.toBeInTheDocument();
  });
});

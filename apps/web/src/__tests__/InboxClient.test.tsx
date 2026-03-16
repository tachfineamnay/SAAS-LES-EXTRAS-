import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import { InboxClient } from "@/app/(dashboard)/dashboard/inbox/InboxClient";
import type { MessagingConversationSeed } from "@/lib/messaging-v1";

const seeds: MessagingConversationSeed[] = [
  {
    id: "booking:MISSION:line-1",
    name: "ESTABLISHMENT Les Lilas",
    context: "Mission SOS",
    source: "BOOKING",
  },
];

describe("InboxClient", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("affiche les conversations disponibles", async () => {
    render(
      <InboxClient
        currentUserId="u-freelance"
        currentUserRole="FREELANCE"
        initialSeeds={seeds}
      />,
    );

    await waitFor(() => {
      expect(screen.getAllByText("ESTABLISHMENT Les Lilas").length).toBeGreaterThan(0);
    });
  });

  it("affiche le thread de la conversation active", async () => {
    render(
      <InboxClient
        currentUserId="u-freelance"
        currentUserRole="FREELANCE"
        initialSeeds={seeds}
      />,
    );

    await waitFor(() => {
      const thread = screen.getByTestId("thread-messages");
      expect(thread).toBeInTheDocument();
      expect(within(thread).getByText(/Conversation initiée depuis un renfort ou atelier/i)).toBeInTheDocument();
    });
  });

  it("envoie un message et refresh le thread", async () => {
    render(
      <InboxClient
        currentUserId="u-freelance"
        currentUserRole="FREELANCE"
        initialSeeds={seeds}
      />,
    );

    const textarea = await screen.findByPlaceholderText(/Votre message/i);
    fireEvent.change(textarea, { target: { value: "Bonjour, je suis disponible." } });
    fireEvent.click(screen.getByRole("button", { name: /Envoyer/i }));

    await waitFor(() => {
      const thread = screen.getByTestId("thread-messages");
      expect(within(thread).getByText("Bonjour, je suis disponible.")).toBeInTheDocument();
    });
  });

  it("affiche l'état vide quand il n'y a aucune conversation", async () => {
    render(
      <InboxClient
        currentUserId="u-freelance"
        currentUserRole="FREELANCE"
        initialSeeds={[]}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText(/Aucune conversation/i)).toBeInTheDocument();
    });
  });

  it("affiche l'état erreur quand un message d'erreur initial est fourni", async () => {
    render(
      <InboxClient
        currentUserId="u-freelance"
        currentUserRole="FREELANCE"
        initialSeeds={[]}
        initialLoadError="Impossible de charger les conversations liées à vos missions et ateliers."
      />,
    );

    await waitFor(() => {
      expect(screen.getByText(/Impossible de charger les conversations/i)).toBeInTheDocument();
    });
  });
});

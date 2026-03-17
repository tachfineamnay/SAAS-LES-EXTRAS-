import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { BookingListWidget } from "@/components/dashboard/BookingListWidget";
import type { BookingLine } from "@/app/actions/bookings";

const booking: BookingLine = {
  lineId: "line-1",
  lineType: "MISSION",
  date: "2026-03-20T09:00:00.000Z",
  typeLabel: "Mission SOS",
  interlocutor: "Clinique A",
  status: "CONFIRMED",
  address: "10 rue de test",
  contactEmail: "contact@test.com",
};

describe("BookingListWidget", () => {
  it("génère un lien détails canonique vers /bookings/[lineType]/[lineId]", () => {
    render(<BookingListWidget bookings={[booking]} />);

    const detailsLink = screen
      .getAllByRole("link")
      .find((link) =>
        link.getAttribute("href") === "/bookings/MISSION/line-1",
      );

    expect(detailsLink).toBeDefined();
  });
});

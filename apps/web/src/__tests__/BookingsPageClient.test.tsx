import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, waitFor } from "@testing-library/react";

const mockGetBookingLineDetails = vi.fn();

vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams("lineType=MISSION&lineId=line-1"),
}));

vi.mock("@/lib/stores/useUIStore", () => ({
  useUIStore: (selector: (state: { userRole: "ESTABLISHMENT" }) => unknown) =>
    selector({ userRole: "ESTABLISHMENT" }),
}));

vi.mock("@/app/actions/bookings", () => ({
  getBookingsPageData: vi.fn(),
  getBookingLineDetails: (...args: unknown[]) => mockGetBookingLineDetails(...args),
  cancelBookingLine: vi.fn(),
  completeBookingLine: vi.fn(),
  confirmBookingLine: vi.fn(),
}));

vi.mock("@/actions/payments", () => ({
  authorizePayment: vi.fn(),
}));

vi.mock("@/components/bookings/BookingLineLot6Panel", () => ({
  BookingLineLot6Panel: () => null,
}));

const { BookingsPageClient } = await import("@/components/bookings/BookingsPageClient");

describe("BookingsPageClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetBookingLineDetails.mockResolvedValue({
      address: "10 rue de test",
      contactEmail: "contact@test.com",
    });
  });

  it("ouvre automatiquement les détails depuis searchParams une seule fois", async () => {
    render(
      <BookingsPageClient
        initialData={{
          nextStep: null,
          lines: [
            {
              lineId: "line-1",
              lineType: "MISSION",
              date: "2026-03-20T09:00:00.000Z",
              typeLabel: "Mission SOS",
              interlocutor: "Clinique A",
              status: "CONFIRMED",
              address: "10 rue de test",
              contactEmail: "contact@test.com",
              relatedBookingId: "booking-1",
            },
          ],
        }}
      />,
    );

    await waitFor(() => {
      expect(mockGetBookingLineDetails).toHaveBeenCalledTimes(1);
    });
    expect(mockGetBookingLineDetails).toHaveBeenCalledWith({
      lineType: "MISSION",
      lineId: "line-1",
    });
  });
});

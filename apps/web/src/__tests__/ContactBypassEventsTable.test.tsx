import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("@/app/actions/admin", () => ({
  banUser: vi.fn(),
  monitorContactBypassEvent: vi.fn(),
  sendAdminOutreach: vi.fn(),
}));

vi.mock("@/components/data/FilterBar", () => ({
  FilterBar: ({
    onFilterChange,
    onSearchChange,
    onReset,
  }: {
    onFilterChange?: (key: string, value: string) => void;
    onSearchChange?: (value: string) => void;
    onReset?: () => void;
  }) => (
    <div>
      <input aria-label="sender-search" onChange={(event) => onSearchChange?.(event.target.value)} />
      <button onClick={() => onFilterChange?.("date", "TODAY")}>Date Today</button>
      <button onClick={() => onFilterChange?.("date", "7D")}>Date 7D</button>
      <button onClick={() => onFilterChange?.("blockedReason", "EMAIL")}>Reason Email</button>
      <button onClick={() => onFilterChange?.("blockedReason", "PHONE")}>Reason Phone</button>
      <button onClick={() => onReset?.()}>Reset</button>
    </div>
  ),
}));

const { ContactBypassEventsTable } = await import("@/components/admin/ContactBypassEventsTable");

describe("ContactBypassEventsTable", () => {
  it("filtre par raison, expéditeur et date", () => {
    const now = new Date();
    const tenDaysAgo = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000);

    render(
      <ContactBypassEventsTable
        events={[
          {
            id: "event-1",
            conversationId: "conv-1",
            bookingId: "booking-1",
            blockedReason: "EMAIL",
            rawExcerpt: "jo@example.com",
            createdAt: now.toISOString(),
            sender: {
              id: "user-1",
              name: "Aya Benali",
              email: "aya@test.fr",
              role: "FREELANCE",
              status: "VERIFIED",
            },
          },
          {
            id: "event-2",
            conversationId: null,
            bookingId: null,
            blockedReason: "PHONE",
            rawExcerpt: "+33 6 12 34 56 78",
            createdAt: tenDaysAgo.toISOString(),
            sender: {
              id: "user-2",
              name: "Nora Diallo",
              email: "nora@test.fr",
              role: "ESTABLISHMENT",
              status: "BANNED",
            },
          },
        ]}
      />,
    );

    expect(screen.getByText("jo@example.com")).toBeInTheDocument();
    expect(screen.getByText("+33 6 12 34 56 78")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Reason Email"));
    expect(screen.getByText("jo@example.com")).toBeInTheDocument();
    expect(screen.queryByText("+33 6 12 34 56 78")).not.toBeInTheDocument();

    fireEvent.click(screen.getByText("Reset"));
    fireEvent.change(screen.getByLabelText("sender-search"), { target: { value: "nora" } });
    expect(screen.getByText("+33 6 12 34 56 78")).toBeInTheDocument();
    expect(screen.queryByText("jo@example.com")).not.toBeInTheDocument();

    fireEvent.click(screen.getByText("Reset"));
    fireEvent.click(screen.getByText("Date 7D"));
    expect(screen.getByText("jo@example.com")).toBeInTheDocument();
    expect(screen.queryByText("+33 6 12 34 56 78")).not.toBeInTheDocument();
  });
});

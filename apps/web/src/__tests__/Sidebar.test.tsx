import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";

const store = {
  userRole: "ESTABLISHMENT" as "ESTABLISHMENT" | "FREELANCE" | null,
};

vi.mock("next/navigation", () => ({
  usePathname: () => "/account/establishment",
}));

vi.mock("@/lib/stores/useUIStore", () => ({
  useUIStore: (selector: (state: typeof store) => unknown) => selector(store),
}));

vi.mock("@/components/ui/sheet", () => ({
  Sheet: ({
    open,
    children,
  }: {
    open: boolean;
    children: ReactNode;
  }) => <>{open ? children : null}</>,
  SheetContent: ({ children }: { children: ReactNode }) => <>{children}</>,
  SheetHeader: ({ children }: { children: ReactNode }) => <>{children}</>,
  SheetTitle: ({ children }: { children: ReactNode }) => <>{children}</>,
  SheetDescription: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

const { Sidebar } = await import("@/components/layout/Sidebar");

describe("Sidebar", () => {
  it("n'affiche qu'un seul lien actif sur /account/establishment", () => {
    render(<Sidebar isMobileOpen={false} onMobileOpenChange={() => undefined} />);

    const activeLinks = screen.getAllByRole("link", { current: "page" });
    expect(activeLinks).toHaveLength(1);
    expect(activeLinks[0]).toHaveTextContent(/mon établissement/i);
  });
});

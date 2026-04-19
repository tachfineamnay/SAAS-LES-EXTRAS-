import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";

const store = {
  userRole: "ESTABLISHMENT" as "ESTABLISHMENT" | "FREELANCE" | null,
};

vi.mock("next/navigation", () => ({
  usePathname: () => "/account/establishment",
}));

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...props
  }: {
    href: string;
    children: ReactNode;
    [key: string]: unknown;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
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

  it("centre le compte établissement sur Mon Établissement et Paramètres", () => {
    render(<Sidebar isMobileOpen={false} onMobileOpenChange={() => undefined} />);

    expect(screen.queryByRole("link", { name: /mon profil/i })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: /mon établissement/i })).toHaveAttribute(
      "href",
      "/account/establishment",
    );
    expect(screen.getByRole("link", { name: /paramètres/i })).toHaveAttribute(
      "href",
      "/settings",
    );
  });
});

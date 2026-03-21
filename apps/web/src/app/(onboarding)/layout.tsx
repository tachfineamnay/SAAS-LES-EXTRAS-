import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Onboarding - Les Extras",
};

export default function OnboardingLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="relative min-h-screen bg-background overflow-hidden">
            {/* Background textures */}
            <div className="pointer-events-none fixed inset-0 bg-grid-lines opacity-40" />
            <div className="pointer-events-none fixed inset-0 bg-grain opacity-30" />
            <div className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] glow-ambient-teal opacity-40" />

            {/* Navigation */}
            <nav className="glass-nav sticky top-0 z-50 border-b border-[hsl(var(--border))]">
                <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4">
                    <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[hsl(var(--teal))]">
                            <span className="text-sm font-bold text-white">LE</span>
                        </div>
                        <span className="text-lg font-bold tracking-tight text-[hsl(var(--text-primary))]">
                            Les Extras
                        </span>
                    </div>
                    <span className="rounded-full bg-[hsl(var(--teal)/0.1)] px-3 py-1 text-xs font-semibold text-[hsl(var(--teal))] uppercase tracking-wider">
                        Configuration
                    </span>
                </div>
            </nav>

            {/* Content */}
            <main className="relative z-10 pt-4 pb-12">
                {children}
            </main>
        </div>
    );
}

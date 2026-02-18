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
        <div className="min-h-screen bg-muted/30">
            <div className="fixed top-0 left-0 p-6 z-50">
                <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-primary" />
                    <span className="text-xl font-bold tracking-tight text-primary">Les Extras</span>
                </div>
            </div>
            {children}
        </div>
    );
}

import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Onboarding - Les Extras",
};

export default function OnboardingLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return <>{children}</>;
}

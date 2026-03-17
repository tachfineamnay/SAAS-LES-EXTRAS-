import { AppShell } from "@/components/layout/AppShell";
import { OnboardingGuard } from "@/components/onboarding/OnboardingGuard";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const onboardingStep = session.user.onboardingStep ?? 0;

  return (
    <OnboardingGuard
      userRole={session.user.role}
      onboardingStep={onboardingStep}
    >
      <AppShell>
        {children}
      </AppShell>
    </OnboardingGuard>
  );
}

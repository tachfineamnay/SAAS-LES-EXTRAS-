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

  // We need to ensure session has onboardingStep. 
  // It should be there as we updated the JWT.
  // We might need to cast or update Session type in lib/session first to be safe,
  // but for runtime it will work if JWT has it.
  const onboardingStep = (session.user as any).onboardingStep ?? 0;

  return (
    <AppShell>
      <OnboardingGuard
        userRole={session.user.role}
        onboardingStep={onboardingStep}
      >
        {children}
      </OnboardingGuard>
    </AppShell>
  );
}

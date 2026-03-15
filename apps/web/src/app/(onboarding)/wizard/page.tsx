import { redirect } from "next/navigation";
import OnboardingWizard from "@/components/onboarding/OnboardingWizard";
import { getSession } from "@/lib/session";

export default async function WizardPage() {
    const session = await getSession();
    if (!session) redirect("/login");

    const user = {
        id: session.user.id,
        role: session.user.role as "FREELANCE" | "ESTABLISHMENT",
    };

    return (
        <div className="container min-h-screen pt-24">
            <div className="text-center mb-10">
                <p className="text-xs font-semibold text-[hsl(var(--teal))] uppercase tracking-widest mb-2">
                    Configuration du compte
                </p>
                <h1 className="text-heading-xl">Complétez votre profil</h1>
                <p className="text-body-sm text-[hsl(var(--text-secondary))] mt-2">
                    {user.role === "ESTABLISHMENT"
                        ? "Configurez votre établissement pour commencer à recruter."
                        : "Renseignez vos informations professionnelles pour être visible."}
                </p>
            </div>

            <OnboardingWizard userId={user.id} userRole={user.role} />
        </div>
    );
}

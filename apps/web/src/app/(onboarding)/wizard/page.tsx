import { redirect } from "next/navigation";
import { EstablishmentFlow } from "@/components/onboarding/EstablishmentFlow";
import { FreelanceFlow } from "@/components/onboarding/FreelanceFlow";
import { getSession } from "@/lib/session";

export default async function WizardPage() {
    const session = await getSession();
    if (!session) redirect("/login");

    const { role, onboardingStep } = session.user;

    // Si l'onboarding est déjà terminé, renvoyer vers l'espace correspondant
    const maxStep = role === "FREELANCE" ? 4 : 3;
    if (onboardingStep >= maxStep) {
        redirect(role === "FREELANCE" ? "/marketplace" : "/dashboard");
    }

    return (
        <div className="min-h-screen flex items-start justify-center pt-16 px-4">
            {role === "ESTABLISHMENT" ? (
                <EstablishmentFlow currentStep={onboardingStep} />
            ) : (
                <FreelanceFlow currentStep={onboardingStep} />
            )}
        </div>
    );
}

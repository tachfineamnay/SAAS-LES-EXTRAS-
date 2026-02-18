// import { currentUser } from "@/app/actions/auth"; // Hypothetical auth getter
import { redirect } from "next/navigation";
import OnboardingWizard from "@/components/onboarding/OnboardingWizard";

// Mocking currentUser for now since we haven't implemented robust session management yet
// In a real scenario, we would fetch the user from the session
const mockUser = {
    id: "user_mock_id",
    role: "TALENT" as "TALENT" | "CLIENT",
};

export default async function WizardPage() {
    // const user = await currentUser();
    // if (!user) redirect("/auth/login");

    // Using mock for development velocity
    const user = mockUser;

    return (
        <div className="container min-h-screen pt-24">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold tracking-tight">Complétez votre profil</h1>
                <p className="text-muted-foreground mt-2">
                    {user.role === "CLIENT" ? "Configurez votre établissement." : "Renseignez vos informations professionnelles."}
                </p>
            </div>

            <OnboardingWizard userId={user.id} userRole={user.role} />
        </div>
    );
}

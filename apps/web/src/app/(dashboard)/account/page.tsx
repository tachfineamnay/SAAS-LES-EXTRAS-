import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { ProfileForm } from "@/components/profile/ProfileForm";

export default async function AccountPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  // Get profile data
  const profile = await prisma.profile.findUnique({
    where: { userId: session.user.id },
  });

  // If no profile (should happen in onboarding, but safety fallback), use session data for defaults
  const defaultValues = {
    firstName: profile?.firstName || "",
    lastName: profile?.lastName || "",
    jobTitle: profile?.jobTitle || "",
    bio: profile?.bio || "",
    avatar: profile?.avatar || undefined,
    city: profile?.city || "",
    zipCode: profile?.zipCode || "",
    siret: profile?.siret || "",
    tvaNumber: profile?.tvaNumber || "",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Mon Profil</h1>
        <p className="text-muted-foreground">
          Gérez vos informations personnelles, votre expertise et vos coordonnées.
        </p>
      </div>

      <div className="max-w-4xl mx-auto pb-10">
        <ProfileForm initialData={defaultValues} />
      </div>
    </div>
  );
}

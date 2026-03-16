import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { UserProfileClient } from "@/components/profile/UserProfileClient";

export default async function AccountPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  let profile = null;
  try {
    profile = await prisma.profile.findUnique({
      where: { userId: session.user.id },
    });
  } catch (error) {
    console.error("Failed to load profile:", error);
  }

  const initialData = {
    firstName: profile?.firstName || "",
    lastName: profile?.lastName || "",
    jobTitle: profile?.jobTitle || "",
    bio: profile?.bio || "",
    avatar: profile?.avatar || undefined,
    phone: profile?.phone || "",
    address: profile?.address || "",
    city: profile?.city || "",
    zipCode: profile?.zipCode || "",
    siret: profile?.siret || "",
    tvaNumber: profile?.tvaNumber || "",
    skills: profile?.skills || [],
    availableCredits: 0,
    createdAt: profile?.createdAt?.toISOString() || new Date().toISOString(),
  };

  return (
    <UserProfileClient
      initialData={initialData}
      userRole={session.user.role as "ESTABLISHMENT" | "FREELANCE" | "ADMIN"}
      userEmail={session.user.email}
    />
  );
}

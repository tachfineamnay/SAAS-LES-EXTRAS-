import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { apiRequest } from "@/lib/api";
import { UserProfileClient } from "@/components/profile/UserProfileClient";

export default async function AccountPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  let profile: Record<string, any> | null = null;
  try {
    const me = await apiRequest<{ profile: Record<string, any> }>("/users/me", {
      token: session.token,
    });
    profile = me.profile ?? null;
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
    createdAt: profile?.createdAt ?? new Date().toISOString(),
  };

  return (
    <UserProfileClient
      initialData={initialData}
      userRole={session.user.role as "ESTABLISHMENT" | "FREELANCE" | "ADMIN"}
      userEmail={session.user.email}
    />
  );
}

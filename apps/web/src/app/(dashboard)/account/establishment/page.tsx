import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { EstablishmentProfileClient } from "@/components/profile/EstablishmentProfileClient";

export default async function EstablishmentPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const profile = await prisma.profile.findUnique({
    where: { userId: session.user.id },
  });

  // Count missions & bookings for stats
  const [totalMissions, activeBookings] = await Promise.all([
    prisma.reliefMission.count({ where: { clientId: session.user.id } }),
    prisma.booking.count({
      where: {
        clientId: session.user.id,
        status: { in: ["PENDING", "CONFIRMED"] },
      },
    }),
  ]);

  const initialData = {
    companyName: profile?.companyName || "",
    phone: profile?.phone || "",
    address: profile?.address || "",
    city: profile?.city || "",
    zipCode: profile?.zipCode || "",
    country: profile?.country || "France",
    siret: profile?.siret || "",
    tvaNumber: profile?.tvaNumber || "",
    bio: profile?.bio || "",
    createdAt: profile?.createdAt?.toISOString() || new Date().toISOString(),
  };

  const stats = {
    totalMissions,
    activeBookings,
    availableCredits: profile?.availableCredits || 0,
  };

  return (
    <EstablishmentProfileClient initialData={initialData} stats={stats} />
  );
}

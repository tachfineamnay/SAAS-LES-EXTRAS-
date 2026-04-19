import { redirect } from "next/navigation";
import { getSession, deleteSession } from "@/lib/session";
import { getBookingsPageDataSafe } from "@/app/actions/bookings";
import { getNotifications } from "@/actions/messaging";
import { InboxClient } from "./InboxClient";
import type { MessagingConversationSeed } from "@/lib/messaging-v1";

export const dynamic = "force-dynamic";

type InboxPageProps = {
  searchParams?: Record<string, string | string[] | undefined>;
};

export default async function InboxPage({ searchParams }: InboxPageProps) {
  const session = await getSession();
  if (!session) redirect("/login");

  let seeds: MessagingConversationSeed[] = [];
  let loadError: string | null = null;
  let notifications: {
    id: string;
    message: string;
    type: string;
    isRead: boolean;
    createdAt: string;
  }[] = [];
  let notificationsError: string | null = null;

  const bookingsResult = await getBookingsPageDataSafe(session.token);
  if (bookingsResult.ok) {
    seeds = bookingsResult.data.lines.map((line) => ({
      id: `booking:${line.lineType}:${line.lineId}`,
      name: line.interlocutor,
      context: line.typeLabel,
      source: "BOOKING" as const,
    }));
  } else if (bookingsResult.unauthorized) {
    await deleteSession();
    redirect("/login");
  } else {
    loadError = bookingsResult.error || "Impossible de charger les conversations liées à vos missions et ateliers.";
  }

  try {
    const raw = await getNotifications();
    notifications = (raw ?? []).slice(0, 8).map((item: any) => ({
      id: item.id,
      message: item.message,
      type: item.type,
      isRead: Boolean(item.isRead),
      createdAt: item.createdAt instanceof Date ? item.createdAt.toISOString() : String(item.createdAt),
    }));
  } catch {
    notificationsError = "Notifications indisponibles pour le moment.";
  }

  const counterpartId =
    typeof searchParams?.counterpartId === "string"
      ? searchParams.counterpartId
      : typeof searchParams?.freelanceId === "string"
        ? searchParams.freelanceId
        : undefined;

  const counterpartName =
    typeof searchParams?.counterpartName === "string"
      ? searchParams.counterpartName
      : typeof searchParams?.freelanceName === "string"
        ? searchParams.freelanceName
        : undefined;

  if (counterpartId && counterpartName) {
    const seededContext = counterpartId.startsWith("mission:") ? "Mission de renfort" : "Fiche FREELANCE";
    seeds.unshift({
      id: `profile:${counterpartId}`,
      name: counterpartName,
      context: seededContext,
      source: "PROFILE",
    });
  }

  const uniqueSeeds = Array.from(new Map(seeds.map((seed) => [seed.id, seed])).values());

  return (
    <InboxClient
      currentUserId={session.user.id}
      currentUserRole={session.user.role === "ESTABLISHMENT" ? "ESTABLISHMENT" : "FREELANCE"}
      initialSeeds={uniqueSeeds}
      initialLoadError={loadError}
      initialNotifications={notifications}
      notificationsError={notificationsError}
    />
  );
}

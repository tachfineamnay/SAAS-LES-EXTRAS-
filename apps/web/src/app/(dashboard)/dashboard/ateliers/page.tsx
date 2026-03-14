import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { MesAteliersClient } from "@/components/dashboard/MesAteliersClient";

export const dynamic = "force-dynamic";

export default async function MesAteliersPage() {
    const session = await getSession();
    if (!session) redirect("/login");
    if (session.user.role !== "FREELANCE") redirect("/dashboard");

    // TODO: Fetch freelance's ateliers from API when endpoint is available
    const ateliers: any[] = [];

    return <MesAteliersClient ateliers={ateliers} />;
}

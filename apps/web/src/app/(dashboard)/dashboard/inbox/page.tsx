import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail } from "lucide-react";

export default function InboxPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Boîte de réception</h1>
                <p className="text-muted-foreground">
                    Gérez vos messages et échanges avec les autres utilisateurs.
                </p>
            </div>

            <div className="grid gap-4">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Mail className="h-5 w-5" />
                            Messages non lus
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
                            <p>Aucun nouveau message pour le moment.</p>
                        </div>
                    </CardContent>
                </Card>

                {/* Placeholder for message list */}
                <div className="border rounded-md p-4 bg-muted/20">
                    <p className="text-sm">Système de messagerie en cours de déploiement...</p>
                </div>
            </div>
        </div>
    );
}

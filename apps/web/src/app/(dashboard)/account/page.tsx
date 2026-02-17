import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AccountPage() {
  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight">Mon Compte</h1>
      <Card>
        <CardHeader>
          <CardTitle>Profil utilisateur</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Cette page est un placeholder MVP. Les paramètres de compte seront ajoutés
          dans un prochain lot.
        </CardContent>
      </Card>
    </section>
  );
}

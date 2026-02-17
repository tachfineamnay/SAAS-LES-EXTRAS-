"use client";

import { FormEvent, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { adminLogin } from "@/app/actions/admin-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AdminLoginPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");

    setError(null);
    startTransition(async () => {
      try {
        await adminLogin({ email, password });
        router.replace("/admin");
        router.refresh();
      } catch (submitError) {
        const message =
          submitError instanceof Error ? submitError.message : "Connexion impossible.";
        setError(message);
      }
    });
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">Le Desk</CardTitle>
          <CardDescription>Connexion administrateur</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={onSubmit}>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" autoComplete="username" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
              />
            </div>

            {error ? <p className="text-sm text-red-600">{error}</p> : null}

            <Button className="w-full" type="submit" disabled={isPending}>
              {isPending ? "Connexion..." : "Se connecter"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}

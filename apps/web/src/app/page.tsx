"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Briefcase, Building2, Calendar, CheckCircle, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20">
      {/* Header */}
      <header className="fixed top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary" />
            <span className="text-xl font-bold tracking-tight text-foreground">Les Extras</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/auth/login" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Se connecter
            </Link>
            <Button asChild size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm">
              <Link href="/auth/register">Créer un compte</Link>
            </Button>
          </nav>
        </div>
      </header>

      <main className="pt-32 pb-16 px-6">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-4xl font-extrabold tracking-tight sm:text-6xl text-foreground"
            >
              La plateforme des extras <br className="hidden sm:block" />
              <span className="text-primary">simplifiée</span> et <span className="text-secondary">efficace</span>.
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto"
            >
              Connectez-vous aux meilleures opportunités ou trouvez les talents qu'il vous faut.
              Sans abonnement, sans contrainte, 100% transparent.
            </motion.p>
          </div>

          {/* Bento Grid */}
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[300px]"
          >
            {/* Main Action - Talent */}
            <motion.div variants={item} className="group relative overflow-hidden rounded-[var(--radius)] border bg-card p-8 hover:shadow-lg hover:shadow-primary/5 transition-all md:col-span-2">
              <div className="absolute top-0 right-0 -mt-16 -mr-16 h-64 w-64 rounded-full bg-primary/10 blur-3xl opacity-50 group-hover:opacity-100 transition-opacity" />

              <div className="relative h-full flex flex-col justify-between">
                <div>
                  <div className="h-12 w-12 rounded-[calc(var(--radius)-4px)] bg-primary/10 flex items-center justify-center mb-6 text-primary">
                    <Briefcase className="h-6 w-6" />
                  </div>
                  <h3 className="text-2xl font-bold text-card-foreground mb-2">Je cherche des missions</h3>
                  <p className="text-muted-foreground max-w-md">
                    Accédez à des centaines de missions dans le secteur médico-social.
                    Gérez votre emploi du temps et recevez vos paiements rapidement.
                  </p>
                </div>

                <div className="flex gap-4 mt-8">
                  <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
                    <Link href="/marketplace">Voir les missions</Link>
                  </Button>
                  <Button asChild variant="outline" className="text-muted-foreground hover:text-foreground">
                    <Link href="/auth/register?role=TALENT">M'inscrire comme Talent</Link>
                  </Button>
                </div>
              </div>
            </motion.div>

            {/* Stat Card */}
            <motion.div variants={item} className="relative overflow-hidden rounded-[var(--radius)] border bg-white p-8 flex flex-col items-center justify-center text-center shadow-sm">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-50" />
              <div className="relative">
                <span className="text-5xl font-bold text-primary tracking-tighter">100%</span>
                <p className="mt-2 text-sm font-medium text-muted-foreground uppercase tracking-widest">Transactionnel</p>
                <p className="mt-4 text-muted-foreground text-sm">
                  Pas d'abonnement caché. <br />Vous ne payez que ce que vous utilisez.
                </p>
              </div>
            </motion.div>

            {/* Client Action */}
            <motion.div variants={item} className="group relative overflow-hidden rounded-[var(--radius)] border bg-card p-8 hover:shadow-lg hover:shadow-secondary/5 transition-all">
              <div className="absolute bottom-0 left-0 -mb-16 -ml-16 h-64 w-64 rounded-full bg-secondary/10 blur-3xl opacity-30 group-hover:opacity-80 transition-opacity" />

              <div className="relative h-full flex flex-col justify-between">
                <div className="h-12 w-12 rounded-[calc(var(--radius)-4px)] bg-secondary/10 flex items-center justify-center mb-6 text-secondary">
                  <Building2 className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-card-foreground mb-2">Je recrute des extras</h3>
                  <p className="text-muted-foreground text-sm">
                    Trouvez des profils vérifiés pour vos besoins ponctuels.
                    Facturation simplifiée et transparente.
                  </p>
                </div>
                <Button asChild className="mt-6 w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground">
                  <Link href="/auth/register?role=CLIENT">Publier une mission</Link>
                </Button>
              </div>
            </motion.div>

            {/* Features / Bento Items */}
            <motion.div variants={item} className="md:col-span-2 relative overflow-hidden rounded-[var(--radius)] border bg-muted/50 p-8">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 h-full items-center">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-foreground font-medium">
                    <CheckCircle className="h-5 w-5 text-emerald-600" />
                    <span>Vérifié</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Tous nos talents sont vérifiés par nos équipes.</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-foreground font-medium">
                    <Calendar className="h-5 w-5 text-secondary" />
                    <span>Flexible</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Gérez vos plannings en temps réel.</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-foreground font-medium">
                    <Star className="h-5 w-5 text-primary" />
                    <span>Qualité</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Notez et soyez noté après chaque mission.</p>
                </div>
              </div>
            </motion.div>

          </motion.div>
        </div>
      </main>

      <footer className="border-t bg-muted/30 py-12 px-6">
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row justify-between items-center gap-6 text-muted-foreground text-sm">
          <p>© 2024 Les Extras. Tous droits réservés.</p>
          <div className="flex gap-6">
            <Link href="#" className="hover:text-foreground transition-colors">Politique de confidentialité</Link>
            <Link href="#" className="hover:text-foreground transition-colors">CGU</Link>
            <Link href="#" className="hover:text-foreground transition-colors">Mentions légales</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

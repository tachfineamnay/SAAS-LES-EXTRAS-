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
            <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Se connecter
            </Link>
            <Button asChild size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm">
              <Link href="/register">Créer un compte</Link>
            </Button>
          </nav>
        </div>
      </header>

      <main className="pt-32 pb-16 px-6">
        <div className="mx-auto max-w-7xl">
          <div className="mb-20 text-center">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center rounded-full border px-4 py-1.5 text-sm font-semibold text-primary mb-6 bg-primary/5"
            >
              <span className="flex h-2 w-2 rounded-full bg-primary mr-2"></span>
              Le réseau d'intervention rapide du médico-social
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl font-extrabold tracking-tight sm:text-6xl text-foreground max-w-4xl mx-auto"
            >
              Ne laissez plus l'absence d'un soignant <span className="text-primary">désorganiser vos équipes</span>.
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-6 text-xl text-muted-foreground max-w-2xl mx-auto"
            >
              Publiez un besoin de renfort en 30 secondes. Les professionnels disponibles autour de vous postulent en un clic. <br className="hidden sm:block" />
              <span className="font-medium text-foreground">Zéro paperasse, facturation automatique en euros.</span>
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-10 flex flex-col sm:flex-row justify-center gap-4"
            >
              <Button asChild size="lg" className="h-12 px-8 text-lg font-semibold shadow-lg shadow-primary/20">
                <Link href="/register?role=CLIENT">Trouver un renfort</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-12 px-8 text-lg">
                <Link href="/register?role=TALENT">Voir les missions</Link>
              </Button>
            </motion.div>
          </div>

          {/* SECTION UTILITÉ (Établissements) */}
          <section className="mb-24">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">De l'urgence à la solution en quelques minutes.</h2>
              <p className="text-muted-foreground text-lg">Pour les Directeurs et Cadres de Santé</p>
            </div>

            <motion.div
              variants={container}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="grid grid-cols-1 md:grid-cols-3 gap-8"
            >
              <motion.div variants={item} className="flex flex-col items-center text-center p-6 rounded-2xl bg-muted/30 border border-border/50">
                <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6 text-primary">
                  <Building2 className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-bold mb-3">Diffusion ciblée</h3>
                <p className="text-muted-foreground">
                  Fini les appels dans le vide. Votre alerte part instantanément aux profils locaux qualifiés (AS, IDE, AES) qui correspondent à vos critères.
                </p>
              </motion.div>

              <motion.div variants={item} className="flex flex-col items-center text-center p-6 rounded-2xl bg-muted/30 border border-border/50">
                <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6 text-primary">
                  <CheckCircle className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-bold mb-3">Validation express</h3>
                <p className="text-muted-foreground">
                  Recevez les candidatures en temps réel. Comparez les profils, consultez leurs notes et bloquez votre renfort en un clic.
                </p>
              </motion.div>

              <motion.div variants={item} className="flex flex-col items-center text-center p-6 rounded-2xl bg-muted/30 border border-border/50">
                <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6 text-primary">
                  <Star className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-bold mb-3">Zéro friction administrative</h3>
                <p className="text-muted-foreground">
                  Contrats, relevés d'heures et facturation sont générés automatiquement. Vous ne gérez que l'essentiel : vos équipes.
                </p>
              </motion.div>
            </motion.div>
          </section>

          {/* SECTION MOTIVATION (Freelances) */}
          <section className="mb-24">
            <div className="relative overflow-hidden rounded-3xl bg-primary text-primary-foreground px-6 py-16 sm:px-12 sm:py-24">
              <div className="absolute top-0 right-0 -mt-20 -mr-20 h-[500px] w-[500px] rounded-full bg-white/5 blur-3xl opacity-50" />
              <div className="absolute bottom-0 left-0 -mb-20 -ml-20 h-[500px] w-[500px] rounded-full bg-white/5 blur-3xl opacity-50" />

              <div className="relative z-10 max-w-7xl mx-auto">
                <div className="text-center mb-16">
                  <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-6">Indépendants : Remplissez votre planning selon vos conditions.</h2>
                  <p className="text-primary-foreground/80 text-lg max-w-2xl mx-auto">
                    Rejoignez la communauté des soignants libres et valorisez votre expertise.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                  <div className="flex flex-col gap-4">
                    <div className="h-12 w-12 rounded-full bg-white/10 flex items-center justify-center text-white font-bold text-xl border border-white/20">1</div>
                    <h3 className="text-2xl font-bold">Postulez en 1 clic</h3>
                    <p className="text-primary-foreground/70 leading-relaxed">
                      Notre système "Fast-Apply" vous permet de répondre à une urgence sans rédiger de devis ni de lettre de motivation.
                    </p>
                  </div>

                  <div className="flex flex-col gap-4">
                    <div className="h-12 w-12 rounded-full bg-white/10 flex items-center justify-center text-white font-bold text-xl border border-white/20">2</div>
                    <h3 className="text-2xl font-bold">Facturation automatique</h3>
                    <p className="text-primary-foreground/70 leading-relaxed">
                      Concentrez-vous sur votre métier. La plateforme édite vos factures et sécurise vos paiements en temps et en heure.
                    </p>
                  </div>

                  <div className="flex flex-col gap-4">
                    <div className="h-12 w-12 rounded-full bg-white/10 flex items-center justify-center text-white font-bold text-xl border border-white/20">3</div>
                    <h3 className="text-2xl font-bold">Diversifiez vos revenus</h3>
                    <p className="text-primary-foreground/70 leading-relaxed">
                      Ne vous limitez pas aux renforts. Proposez directement vos propres ateliers et formations aux établissements du réseau.
                    </p>
                  </div>
                </div>

                <div className="mt-16 text-center">
                  <Button asChild size="lg" variant="secondary" className="h-14 px-10 text-lg font-bold shadow-xl">
                    <Link href="/register?role=TALENT">Créer mon profil Freelance</Link>
                  </Button>
                  <p className="mt-4 text-sm text-primary-foreground/60">Inscription gratuite. Commission transparente de 0% pour les 100 premiers inscrits.</p>
                </div>
              </div>
            </div>
          </section>
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

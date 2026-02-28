"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Briefcase, Building2, Calendar, CheckCircle, Star, ArrowRight, ShieldCheck } from "lucide-react";
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
    <div className="relative min-h-screen bg-background text-foreground overflow-hidden selection:bg-primary/20">
      {/* Dynamic Background Halos for true glassmorphism */}
      <div className="pointer-events-none fixed inset-0 z-0" aria-hidden="true">
        <div className="absolute inset-0 halo-primary opacity-80" />
        <div className="absolute inset-[30%] halo-secondary opacity-60" />
      </div>

      <div className="relative z-10">
        {/* Header - Glassmorphic top navigation */}
        <header className="fixed top-0 z-50 w-full glass-surface-dense rounded-none border-t-0 border-x-0">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-xl bg-primary shadow-sm flex items-center justify-center">
                <span className="text-white font-bold text-xs">LE</span>
              </div>
              <span className="text-xl font-bold tracking-tight text-foreground">Les Extras</span>
            </div>
            <nav className="flex items-center gap-4">
              <Link href="/login" className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors">
                Se connecter
              </Link>
              <Button asChild size="sm" className="min-h-[40px] shadow-sm">
                <Link href="/register">Essayer gratuitement</Link>
              </Button>
            </nav>
          </div>
        </header>

        <main className="pt-32 pb-16 px-6">
          <div className="mx-auto max-w-7xl">
            {/* HERO SECTION */}
            <div className="mb-32 text-center relative">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center rounded-full glass-surface px-4 py-1.5 text-sm font-semibold text-primary mb-8"
              >
                <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse"></span>
                La plateforme n°1 des vacations médico-sociales
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-5xl font-extrabold tracking-tight sm:text-7xl text-foreground max-w-5xl mx-auto leading-tight"
              >
                Ne laissez plus l'absence d'un soignant <span className="text-primary bg-clip-text">désorganiser</span> vos équipes.
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="mt-6 text-xl text-muted-foreground/90 max-w-2xl mx-auto font-medium"
              >
                Publiez un besoin en 30 secondes. Les freelances locaux vérifiés postulent en un clic. Zéro paperasse, facturation automatique en euros.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="mt-10 flex flex-col sm:flex-row justify-center gap-4"
              >
                <Button asChild size="lg" className="h-14 px-8 text-lg font-semibold shadow-xl shadow-primary/20">
                  <Link href="/register?role=CLIENT">Trouver un renfort <ArrowRight className="ml-2 h-5 w-5" /></Link>
                </Button>
                <Button asChild size="lg" variant="glass" className="h-14 px-8 text-lg font-bold">
                  <Link href="/register?role=TALENT">Je suis freelance</Link>
                </Button>
              </motion.div>
            </div>

            {/* VALUE PROP - Premium Bento Grid for features */}
            <section className="mb-32">
              <div className="text-center mb-16">
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4 text-foreground">
                  De l'urgence à la solution en quelques minutes.
                </h2>
                <p className="text-muted-foreground text-lg font-medium">Conçu pour les Directeurs d'Établissement et Cadres de Santé</p>
              </div>

              <motion.div
                variants={container}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-100px" }}
                className="grid grid-cols-1 md:grid-cols-3 gap-6"
              >
                <motion.div variants={item} className="p-8 rounded-3xl glass-surface flex flex-col items-start gap-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                  <div className="h-14 w-14 rounded-2xl bg-secondary/15 flex items-center justify-center text-secondary shadow-inner">
                    <ShieldCheck className="h-7 w-7" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mt-2">Diffusion ciblée</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Fini les appels dans le vide. Votre alerte part instantanément aux profils locaux qualifiés (AS, IDE, AES) correspondants à vos critères de validation.
                  </p>
                </motion.div>

                <motion.div variants={item} className="p-8 rounded-3xl glass-surface flex flex-col items-start gap-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                  <div className="h-14 w-14 rounded-2xl bg-primary/15 flex items-center justify-center text-primary shadow-inner">
                    <CheckCircle className="h-7 w-7" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mt-2">Validation express</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Recevez les candidatures en temps réel. Comparez les profils, consultez leurs notes et expériences, et bloquez votre renfort en un seul clic.
                  </p>
                </motion.div>

                <motion.div variants={item} className="p-8 rounded-3xl glass-surface flex flex-col items-start gap-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                  <div className="h-14 w-14 rounded-2xl bg-muted-foreground/15 flex items-center justify-center text-muted-foreground shadow-inner">
                    <Star className="h-7 w-7" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mt-2">Zéro friction administrative</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Contrats, relevés d'heures et facturation (générée automatiquement). Vous ne gérez que l'essentiel : l'intégration dans vos équipes.
                  </p>
                </motion.div>
              </motion.div>
            </section>

            {/* FREELANCE FOCUS - Eye-catching asymmetric section */}
            <section className="mb-24">
              <div className="relative rounded-[2.5rem] p-[2px] overflow-hidden bg-gradient-to-br from-primary/30 via-primary/5 to-secondary/30">
                <div className="absolute inset-0 bg-background/80 backdrop-blur-3xl" />

                <div className="relative z-10 glass-surface rounded-[calc(2.5rem-2px)] p-8 sm:p-16 border-none shadow-none flex flex-col lg:flex-row items-center gap-12">
                  <div className="flex-1 space-y-8">
                    <div className="inline-flex items-center rounded-lg bg-primary/10 px-3 py-1 font-semibold text-primary">
                      Espace Indépendants
                    </div>
                    <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground leading-tight">
                      Remplissez votre planning selon <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">vos conditions</span>.
                    </h2>
                    <p className="text-lg text-muted-foreground font-medium max-w-xl leading-relaxed">
                      Rejoignez la communauté des soignants libres. Postulez en 1 clic grâce au Fast-Apply, bénéficiez de la facturation automatique et diversifiez vos revenus avec la marketplace.
                    </p>

                    <ul className="space-y-4 pt-4">
                      {[
                        "Candidature instantanée sans lettre de motivation",
                        "Génération automatique des factures et contrats",
                        "Proposez vos propres ateliers aux établissements"
                      ].map((feature, i) => (
                        <li key={i} className="flex items-center gap-3">
                          <CheckCircle className="h-5 w-5 text-primary" />
                          <span className="font-semibold text-foreground/90">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="pt-6">
                      <Button asChild size="lg" className="h-14 px-8 text-lg font-bold shadow-xl">
                        <Link href="/register?role=TALENT">Créer mon profil gratuit <ArrowRight className="ml-2 h-5 w-5" /></Link>
                      </Button>
                      <p className="mt-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Commission transparente 0% limitées</p>
                    </div>
                  </div>

                  {/* Visual mockup of the app dashboard on the right */}
                  <div className="flex-1 w-full relative">
                    <div className="glass-surface p-6 rounded-2xl w-full border border-white/60 shadow-2xl shadow-primary/10 rotate-2 translate-x-4">
                      <div className="flex items-center justify-between mb-6 pb-4 border-b border-border/40">
                        <div className="space-y-1">
                          <div className="h-2 w-20 rounded bg-muted-foreground/30" />
                          <div className="h-4 w-32 rounded bg-foreground/80" />
                        </div>
                        <div className="h-8 w-8 rounded-full bg-secondary/20" />
                      </div>
                      <div className="space-y-4">
                        <div className="h-24 rounded-xl bg-card border border-border/40 p-4 flex gap-4">
                          <div className="h-12 w-12 rounded-lg bg-primary/10" />
                          <div className="space-y-2 flex-1 pt-1">
                            <div className="h-3 w-1/2 rounded bg-foreground/70" />
                            <div className="h-2 w-1/3 rounded bg-muted-foreground/40" />
                          </div>
                        </div>
                        <div className="h-24 rounded-xl bg-card border border-border/40 p-4 flex gap-4">
                          <div className="h-12 w-12 rounded-lg bg-muted" />
                          <div className="space-y-2 flex-1 pt-1">
                            <div className="h-3 w-1/2 rounded bg-foreground/70" />
                            <div className="h-2 w-1/3 rounded bg-muted-foreground/40" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </main>

        <footer className="glass-surface-dense border-x-0 border-b-0 py-12 px-6 relative z-10 w-full rounded-none">
          <div className="mx-auto max-w-7xl flex flex-col md:flex-row justify-between items-center gap-6 text-muted-foreground font-medium text-sm">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded border border-border/80 bg-background flex items-center justify-center">
                <span className="text-foreground font-bold text-[10px]">LE</span>
              </div>
              <p>© 2026 Les Extras. Plateforme premium de recrutement.</p>
            </div>
            <div className="flex gap-8">
              <Link href="#" className="hover:text-primary transition-colors">Politique de confidentialité</Link>
              <Link href="#" className="hover:text-primary transition-colors">CGU</Link>
              <Link href="#" className="hover:text-primary transition-colors">Contact presse</Link>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import {
  ArrowRight,
  CheckCircle,
  ShieldCheck,
  Star,
  Zap,
  Clock,
  MapPin,
  TrendingUp,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";

/* ─── animation presets ─── */
const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.12 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};

/* ─── floating UI simulation ─── */
function LiveMatchSimulation() {
  return (
    <div className="relative w-full max-w-md mx-auto mt-16 lg:mt-0 select-none" aria-hidden="true">
      {/* Step 1 — Alert card */}
      <motion.div
        initial={{ opacity: 0, x: -30, rotate: -2 }}
        animate={{ opacity: 1, x: 0, rotate: -1 }}
        transition={{ delay: 0.6, duration: 0.6, ease: "easeOut" }}
        className="glass-surface rounded-2xl p-5 shadow-lg"
      >
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
            <Zap className="h-5 w-5 text-primary" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-bold text-foreground">Nouveau besoin publié</p>
            <p className="text-xs text-muted-foreground">IDE · EHPAD Les Oliviers · Mardi 9h–17h</p>
          </div>
        </div>
      </motion.div>

      {/* Step 2 — Match notification */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: 1.4, duration: 0.5, ease: "easeOut" }}
        className="glass-surface rounded-2xl p-4 mt-3 ml-8 shadow-lg border-secondary/30"
      >
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2">
            <div className="h-8 w-8 rounded-full bg-secondary/20 border-2 border-white" />
            <div className="h-8 w-8 rounded-full bg-primary/20 border-2 border-white" />
            <div className="h-8 w-8 rounded-full bg-muted border-2 border-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">3 profils disponibles</p>
            <p className="text-xs text-muted-foreground">à moins de 15 km de votre établissement</p>
          </div>
        </div>
      </motion.div>

      {/* Step 3 — Confirmed */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 2.2, duration: 0.4, type: "spring", stiffness: 200 }}
        className="mt-3 ml-16 inline-flex items-center gap-2 rounded-full bg-emerald-50 border border-emerald-200 px-4 py-2 shadow-sm"
      >
        <CheckCircle className="h-4 w-4 text-emerald-600" />
        <span className="text-sm font-semibold text-emerald-700">Confirmé en 47 secondes</span>
      </motion.div>
    </div>
  );
}

/* ─── feature card ─── */
function FeatureCard({
  icon: Icon,
  title,
  description,
  iconBg,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  iconBg: string;
}) {
  return (
    <motion.div
      variants={fadeUp}
      className="p-8 rounded-3xl glass-surface flex flex-col items-start gap-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg group"
    >
      <div className={`h-14 w-14 rounded-2xl ${iconBg} flex items-center justify-center shadow-inner transition-transform duration-300 group-hover:scale-110`}>
        <Icon className="h-7 w-7" />
      </div>
      <h3 className="text-xl font-bold text-foreground mt-2">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </motion.div>
  );
}

/* ─── stat pill ─── */
function StatPill({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1 px-6">
      <span className="text-2xl font-extrabold text-foreground tabular-nums">{value}</span>
      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</span>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════ */
export default function HomePage() {
  const bentoBg = useRef<HTMLElement>(null);
  const bentoInView = useInView(bentoBg, { once: true, margin: "-100px" });

  return (
    <div className="relative min-h-screen bg-background text-foreground overflow-hidden selection:bg-primary/20">
      {/* ─── Background halos ─── */}
      <div className="pointer-events-none fixed inset-0 z-0" aria-hidden="true">
        <div className="absolute inset-0 halo-primary opacity-70" />
        <div className="absolute inset-[20%] halo-secondary opacity-50" />
      </div>

      <div className="relative z-10">
        {/* ═══ NAVBAR ═══ */}
        <header className="fixed top-0 z-50 w-full glass-surface-dense rounded-none border-t-0 border-x-0">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-xl bg-primary shadow-sm flex items-center justify-center">
                <span className="text-white font-bold text-xs">LE</span>
              </div>
              <span className="text-lg font-bold tracking-tight text-foreground">Les Extras</span>
            </Link>
            <nav className="flex items-center gap-3">
              <Link
                href="/login"
                className="hidden sm:inline-flex text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
              >
                Se connecter
              </Link>
              <Button asChild size="sm" className="min-h-[40px] shadow-sm">
                <Link href="/register">Essayer gratuitement</Link>
              </Button>
            </nav>
          </div>
        </header>

        <main>
          {/* ═══ HERO ═══ */}
          <section className="pt-28 pb-20 px-6 lg:pt-36 lg:pb-28">
            <div className="mx-auto max-w-7xl">
              <div className="flex flex-col lg:flex-row lg:items-center lg:gap-16">
                {/* Left — Copy */}
                <div className="flex-1 text-center lg:text-left">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4 }}
                    className="inline-flex items-center rounded-full glass-surface px-4 py-1.5 text-sm font-semibold text-primary mb-8"
                  >
                    <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse" />
                    Plateforme n°1 du médico-social
                  </motion.div>

                  <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-foreground leading-[1.1]"
                  >
                    Ne laissez plus l&apos;absence d&apos;un soignant{" "}
                    <span className="text-primary">désorganiser</span> vos équipes.
                  </motion.h1>

                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="mt-6 text-lg text-muted-foreground max-w-xl mx-auto lg:mx-0 leading-relaxed"
                  >
                    Publiez un besoin en 30 secondes. Les freelances vérifiés postulent en un clic.
                    Zéro paperasse, facturation automatique.
                  </motion.p>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="mt-8 flex flex-col sm:flex-row justify-center lg:justify-start gap-3"
                  >
                    <Button asChild size="lg" className="h-13 px-7 text-base font-semibold shadow-xl shadow-primary/20">
                      <Link href="/register?role=CLIENT">
                        Trouver un renfort <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                    <Button asChild size="lg" variant="outline" className="h-13 px-7 text-base font-semibold">
                      <Link href="/register?role=TALENT">Je suis indépendant</Link>
                    </Button>
                  </motion.div>
                </div>

                {/* Right — Live matching animation */}
                <div className="flex-1 mt-12 lg:mt-0">
                  <LiveMatchSimulation />
                </div>
              </div>
            </div>
          </section>

          {/* ═══ SOCIAL PROOF STRIP ═══ */}
          <section className="py-8 border-y border-border/40 bg-muted/20">
            <div className="mx-auto max-w-5xl flex flex-wrap justify-center gap-8 sm:gap-0 sm:divide-x sm:divide-border/40">
              <StatPill value="2,847" label="Missions ce mois" />
              <StatPill value="47s" label="Temps moyen de match" />
              <StatPill value="98%" label="Satisfaction" />
              <StatPill value="0€" label="Frais d'inscription" />
            </div>
          </section>

          {/* ═══ FEATURES BENTO ═══ */}
          <section ref={bentoBg} className="py-24 px-6">
            <div className="mx-auto max-w-7xl">
              <div className="text-center mb-16">
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4 text-foreground">
                  De l&apos;urgence à la solution en quelques minutes.
                </h2>
                <p className="text-muted-foreground text-lg font-medium">
                  Conçu pour les Directeurs d&apos;Établissement et Cadres de Santé
                </p>
              </div>

              <motion.div
                variants={stagger}
                initial="hidden"
                animate={bentoInView ? "show" : "hidden"}
                className="grid grid-cols-1 md:grid-cols-3 gap-6"
              >
                <FeatureCard
                  icon={ShieldCheck}
                  title="Diffusion ciblée"
                  description="Votre alerte part instantanément aux profils locaux qualifiés (AS, IDE, AES) qui correspondent à vos critères."
                  iconBg="bg-secondary/15 text-secondary"
                />
                <FeatureCard
                  icon={Clock}
                  title="Validation express"
                  description="Recevez les candidatures en temps réel. Comparez les profils, consultez les notes et bloquez votre renfort en un clic."
                  iconBg="bg-primary/15 text-primary"
                />
                <FeatureCard
                  icon={Star}
                  title="Zéro friction administrative"
                  description="Contrats, relevés d'heures et facturation générés automatiquement. Vous ne gérez que l'essentiel."
                  iconBg="bg-amber-500/15 text-amber-600"
                />
              </motion.div>
            </div>
          </section>

          {/* ═══ FREELANCE SECTION ═══ */}
          <section className="pb-24 px-6">
            <div className="mx-auto max-w-7xl">
              <div className="relative rounded-[2rem] p-[1.5px] overflow-hidden bg-gradient-to-br from-primary/40 via-transparent to-secondary/40">
                <div className="relative glass-surface rounded-[calc(2rem-1.5px)] p-8 sm:p-14 lg:p-16 border-none">
                  <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
                    {/* Left copy */}
                    <div className="flex-1 space-y-6">
                      <div className="inline-flex items-center rounded-lg bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
                        Espace Indépendants
                      </div>
                      <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground leading-tight">
                        Remplissez votre planning selon{" "}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                          vos conditions
                        </span>
                        .
                      </h2>
                      <p className="text-lg text-muted-foreground font-medium max-w-xl leading-relaxed">
                        Rejoignez la communauté des soignants libres. Fast-Apply en 1 clic,
                        facturation auto, marketplace de services.
                      </p>

                      <ul className="space-y-3 pt-2">
                        {[
                          "Candidature instantanée sans lettre de motivation",
                          "Factures et contrats générés automatiquement",
                          "Proposez vos propres ateliers aux établissements",
                        ].map((f, i) => (
                          <li key={i} className="flex items-center gap-3">
                            <CheckCircle className="h-5 w-5 text-primary shrink-0" />
                            <span className="font-medium text-foreground/90">{f}</span>
                          </li>
                        ))}
                      </ul>

                      <div className="pt-4 flex flex-col sm:flex-row gap-3">
                        <Button asChild size="lg" className="h-13 px-7 text-base font-bold shadow-xl">
                          <Link href="/register?role=TALENT">
                            Créer mon profil gratuit <ArrowRight className="ml-2 h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Commission 0 % pour les 100 premiers inscrits
                      </p>
                    </div>

                    {/* Right — abstract UI mockup */}
                    <div className="flex-1 w-full relative hidden lg:block" aria-hidden="true">
                      <div className="glass-surface p-6 rounded-2xl w-full border border-white/60 shadow-2xl shadow-primary/5 rotate-1">
                        {/* Fake header */}
                        <div className="flex items-center justify-between mb-5 pb-4 border-b border-border/30">
                          <div className="space-y-1.5">
                            <div className="h-2 w-16 rounded-full bg-muted-foreground/25" />
                            <div className="h-3.5 w-28 rounded-full bg-foreground/70" />
                          </div>
                          <div className="h-8 w-8 rounded-full bg-secondary/20" />
                        </div>
                        {/* Fake KPI row */}
                        <div className="grid grid-cols-3 gap-3 mb-5">
                          {[
                            { w: "w-10", color: "bg-primary/15" },
                            { w: "w-8", color: "bg-secondary/15" },
                            { w: "w-12", color: "bg-emerald-500/15" },
                          ].map((k, i) => (
                            <div key={i} className="rounded-xl bg-card border border-border/30 p-3 space-y-2">
                              <div className={`h-2 ${k.w} rounded-full ${k.color}`} />
                              <div className="h-4 w-8 rounded-full bg-foreground/60" />
                            </div>
                          ))}
                        </div>
                        {/* Fake cards */}
                        {[1, 2].map((n) => (
                          <div key={n} className="rounded-xl bg-card border border-border/30 p-4 mb-3 flex gap-3">
                            <div className="h-10 w-10 rounded-lg bg-primary/10 shrink-0" />
                            <div className="space-y-2 flex-1 pt-0.5">
                              <div className="h-2.5 w-2/3 rounded-full bg-foreground/60" />
                              <div className="h-2 w-1/3 rounded-full bg-muted-foreground/30" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>

        {/* ═══ FOOTER ═══ */}
        <footer className="glass-surface-dense border-x-0 border-b-0 rounded-none py-10 px-6">
          <div className="mx-auto max-w-7xl flex flex-col md:flex-row justify-between items-center gap-6 text-muted-foreground text-sm font-medium">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-lg bg-primary/10 flex items-center justify-center">
                <span className="text-primary font-bold text-[9px]">LE</span>
              </div>
              <p>© 2026 Les Extras. Tous droits réservés.</p>
            </div>
            <div className="flex gap-6">
              <Link href="/privacy" className="hover:text-primary transition-colors">Confidentialité</Link>
              <Link href="/terms" className="hover:text-primary transition-colors">CGU</Link>
              <Link href="#" className="hover:text-primary transition-colors">Contact</Link>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

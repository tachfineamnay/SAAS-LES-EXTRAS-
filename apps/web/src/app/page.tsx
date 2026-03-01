"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import {
  ArrowRight,
  CheckCircle,
  ShieldCheck,
  Clock,
  Star,
  Zap,
  MapPin,
  TrendingUp,
  Users,
  Sparkles,
  BadgeCheck,
  ArrowUpRight,
  Building2,
  CalendarDays,
  FileText,
  DollarSign,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

/* ────────────────────────────────────────
   ANIMATION CONFIG
   ──────────────────────────────────────── */
const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};
const riseUp = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" as const } },
};

/* ────────────────────────────────────────
   LIVE MATCHING SIMULATION
   ──────────────────────────────────────── */
function MatchingPulse() {
  return (
    <div className="relative w-full max-w-[420px] mx-auto" aria-hidden="true">
      {/* Ambient coral glow */}
      <div className="absolute -inset-10 rounded-[3rem] bg-gradient-to-br from-primary/10 via-primary/4 to-secondary/8 blur-3xl" />

      {/* Step 1 — Alert */}
      <motion.div
        initial={{ opacity: 0, y: 40, rotate: -3 }}
        animate={{ opacity: 1, y: 0, rotate: -2 }}
        transition={{ delay: 0.5, duration: 0.7, ease: "easeOut" as const }}
        className="relative rounded-2xl p-5 shadow-lg glass-coral"
      >
        <div className="flex items-start gap-3.5">
          <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-primary/25 to-primary/10 flex items-center justify-center shrink-0">
            <Zap className="h-5 w-5 text-primary" />
          </div>
          <div className="min-w-0 space-y-1">
            <div className="flex items-center gap-2">
              <p className="text-sm font-bold text-foreground">Besoin urgent publié</p>
              <Badge variant="error" className="text-[9px] px-1.5 py-0 h-4">SOS</Badge>
            </div>
            <p className="text-xs text-muted-foreground">IDE · EHPAD Les Oliviers · Demain 7h–15h</p>
            <div className="flex items-center gap-3 pt-1">
              <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <MapPin className="h-3 w-3" /> Marseille
              </span>
              <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600">
                <DollarSign className="h-3 w-3" /> 320€ net
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Step 2 — Match */}
      <motion.div
        initial={{ opacity: 0, y: 30, x: 20 }}
        animate={{ opacity: 1, y: 0, x: 0 }}
        transition={{ delay: 1.5, duration: 0.6, ease: "easeOut" as const }}
        className="relative rounded-2xl p-4 mt-3 ml-6 shadow-lg glass-azure"
      >
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2.5">
            {["from-secondary/30 to-secondary/10", "from-primary/30 to-primary/10", "from-emerald-500/30 to-emerald-500/10"].map((grad, i) => (
              <div key={i} className={`h-9 w-9 rounded-full bg-gradient-to-br ${grad} border-2 border-white flex items-center justify-center`}>
                <Users className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
            ))}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-foreground">3 profils compatibles</p>
            <p className="text-[11px] text-muted-foreground">IDE vérifiés · à moins de 12 km</p>
          </div>
        </div>
      </motion.div>

      {/* Step 3 — Confirmed */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ delay: 2.4, duration: 0.4, type: "spring", stiffness: 300, damping: 20 }}
        className="mt-3 ml-14 inline-flex items-center gap-2.5 rounded-full bg-gradient-to-r from-emerald-50 to-emerald-100/60 border border-emerald-200/80 px-4 py-2.5 shadow-sm"
      >
        <div className="h-5 w-5 rounded-full bg-emerald-500/15 flex items-center justify-center">
          <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
        </div>
        <div>
          <span className="text-sm font-bold text-emerald-700">Confirmé</span>
          <span className="text-[10px] text-emerald-600 ml-1.5">en 47 secondes</span>
        </div>
      </motion.div>
    </div>
  );
}

/* ────────────────────────────────────────
   BENTO FEATURE CARD (Coral Glass)
   ──────────────────────────────────────── */
function FeatureCard({
  icon: Icon,
  title,
  description,
  variant = "coral",
  large,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  variant?: "coral" | "azure";
  large?: boolean;
}) {
  const isAzure = variant === "azure";
  return (
    <motion.div
      variants={riseUp}
      className={`group relative overflow-hidden rounded-3xl p-8 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl ${large ? "md:col-span-2 md:row-span-2 md:p-10" : ""} ${isAzure ? "glass-azure" : "glass-coral"}`}
    >
      {/* Decorative gradient orb */}
      <div className={`absolute -top-8 -right-8 h-40 w-40 rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity duration-500 ${isAzure ? "bg-secondary" : "bg-primary"}`} />

      <div className="relative z-10 flex flex-col h-full">
        <div className={`h-12 w-12 rounded-2xl flex items-center justify-center mb-5 ${isAzure ? "bg-secondary/15 ring-1 ring-secondary/15" : "bg-primary/15 ring-1 ring-primary/15"}`}>
          <Icon className={`h-6 w-6 ${isAzure ? "text-secondary" : "text-primary"}`} />
        </div>
        <h3 className={`font-bold text-foreground mb-2 ${large ? "text-2xl" : "text-lg"}`}>{title}</h3>
        <p className={`text-muted-foreground leading-relaxed ${large ? "text-base max-w-md" : "text-sm"}`}>{description}</p>
      </div>
    </motion.div>
  );
}

/* ────────────────────────────────────────
   STAT COUNTER
   ──────────────────────────────────────── */
function StatCounter({ value, label, suffix }: { value: string; label: string; suffix?: string }) {
  return (
    <motion.div variants={riseUp} className="flex flex-col items-center gap-1 px-4 sm:px-8">
      <div className="flex items-baseline gap-0.5">
        <span className="text-3xl sm:text-4xl font-extrabold text-foreground tabular-nums tracking-tight">{value}</span>
        {suffix && <span className="text-lg font-bold text-primary">{suffix}</span>}
      </div>
      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">{label}</span>
    </motion.div>
  );
}

/* ────────────────────────────────────────
   TESTIMONIAL
   ──────────────────────────────────────── */
function TestimonialCard({ quote, name, role, rating }: { quote: string; name: string; role: string; rating: number }) {
  return (
    <motion.div
      variants={riseUp}
      className="glass-coral rounded-2xl p-6 flex flex-col gap-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
    >
      <div className="flex gap-0.5">
        {Array.from({ length: rating }).map((_, i) => (
          <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
        ))}
      </div>
      <p className="text-sm text-foreground/90 leading-relaxed italic">&ldquo;{quote}&rdquo;</p>
      <div className="mt-auto pt-3 border-t border-primary/8">
        <p className="text-sm font-bold text-foreground">{name}</p>
        <p className="text-xs text-muted-foreground">{role}</p>
      </div>
    </motion.div>
  );
}

/* ════════════════════════════════════════
   MAIN LANDING PAGE
   ════════════════════════════════════════ */
export default function HomePage() {
  const parallaxRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: parallaxRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <div className="relative min-h-screen bg-background text-foreground overflow-x-hidden selection:bg-primary/20">
      {/* ─── Ambient blobs: coral + azure ─── */}
      <div className="pointer-events-none fixed inset-0 z-0" aria-hidden="true">
        <div className="absolute -top-40 right-0 w-[900px] h-[900px] rounded-full bg-gradient-to-br from-primary/10 to-primary/3 blur-3xl" />
        <div className="absolute -bottom-40 -left-20 w-[700px] h-[700px] rounded-full bg-gradient-to-tr from-secondary/8 to-secondary/2 blur-3xl" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[400px] rounded-full bg-gradient-to-b from-primary/5 to-transparent blur-3xl" />
      </div>

      <div className="relative z-10">

        {/* ═══ NAVBAR ═══ */}
        <header className="fixed top-0 z-50 w-full">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-3">
            <nav className="flex h-14 items-center justify-between rounded-2xl glass-surface-dense px-4 sm:px-5">
              <Link href="/" className="flex items-center gap-2">
                <Image
                  src="/logo-adepa.png"
                  alt="ADEPA Les Extras"
                  width={120}
                  height={40}
                  className="h-9 w-auto object-contain"
                  priority
                />
              </Link>

              <div className="hidden md:flex items-center gap-6">
                <Link href="#features" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Fonctionnalités</Link>
                <Link href="#freelances" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Indépendants</Link>
                <Link href="#testimonials" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Témoignages</Link>
              </div>

              <div className="flex items-center gap-2">
                <Button asChild variant="ghost" size="sm" className="text-sm font-semibold hidden sm:inline-flex">
                  <Link href="/login">Se connecter</Link>
                </Button>
                <Button asChild size="sm" className="rounded-xl shadow-md shadow-primary/15 px-4 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/95 hover:to-primary/85">
                  <Link href="/register">Commencer<ArrowRight className="ml-1 h-3.5 w-3.5" /></Link>
                </Button>
              </div>
            </nav>
          </div>
        </header>

        <main>
          {/* ═══ HERO ═══ */}
          <section ref={parallaxRef} className="relative min-h-screen flex items-center pt-24 pb-16 px-6 lg:pt-32 lg:pb-24">
            <motion.div style={{ y: heroY, opacity: heroOpacity }} className="mx-auto max-w-7xl w-full">
              <div className="flex flex-col lg:flex-row lg:items-center lg:gap-20">
                <div className="flex-1 max-w-2xl">
                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="inline-flex items-center gap-2 rounded-full glass-coral px-4 py-1.5 text-xs font-bold text-primary mb-8"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    Plateforme #1 du médico-social en France
                  </motion.div>

                  <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="text-[clamp(2.4rem,5vw,4.2rem)] font-extrabold tracking-tight text-foreground leading-[1.08]"
                  >
                    Un soignant absent ?{" "}
                    <span className="relative inline-block">
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary to-secondary">
                        Remplacé en 47 secondes.
                      </span>
                      <motion.span
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ delay: 0.8, duration: 0.5, ease: "easeOut" as const }}
                        className="absolute -bottom-1 left-0 right-0 h-[3px] rounded-full origin-left bg-gradient-to-r from-primary to-secondary"
                      />
                    </span>
                  </motion.h1>

                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.25 }}
                    className="mt-6 text-lg text-muted-foreground max-w-lg leading-relaxed"
                  >
                    Publiez votre besoin en <strong className="text-foreground">30 secondes</strong>.
                    Des professionnels vérifiés postulent <strong className="text-foreground">en un clic</strong>.
                    Contrats et facturation <strong className="text-foreground">100% automatiques</strong>.
                  </motion.p>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="mt-8 flex flex-col sm:flex-row gap-3"
                  >
                    <Button asChild size="lg" className="h-13 px-7 text-base font-bold rounded-xl shadow-xl shadow-primary/20 bg-gradient-to-r from-primary to-primary/85 hover:from-primary/95 hover:to-primary/80 transition-all">
                      <Link href="/register?role=CLIENT">
                        Trouver un renfort
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                    <Button asChild size="lg" variant="outline" className="h-13 px-7 text-base font-semibold rounded-xl border-primary/20 hover:bg-primary/5 hover:border-primary/30 transition-all">
                      <Link href="/register?role=TALENT">Je suis indépendant</Link>
                    </Button>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                    className="mt-8 flex items-center gap-4 text-sm text-muted-foreground"
                  >
                    <div className="flex items-center gap-1.5">
                      <BadgeCheck className="h-4 w-4 text-emerald-500" />
                      <span>Inscription gratuite</span>
                    </div>
                    <span className="text-border">•</span>
                    <div className="flex items-center gap-1.5">
                      <ShieldCheck className="h-4 w-4 text-secondary" />
                      <span>Profils vérifiés</span>
                    </div>
                    <span className="text-border hidden sm:inline">•</span>
                    <div className="hidden sm:flex items-center gap-1.5">
                      <FileText className="h-4 w-4 text-primary" />
                      <span>Zéro paperasse</span>
                    </div>
                  </motion.div>
                </div>

                <motion.div
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" as const }}
                  className="flex-1 mt-16 lg:mt-0 flex justify-center"
                >
                  <MatchingPulse />
                </motion.div>
              </div>
            </motion.div>
          </section>

          {/* ═══ STATS STRIP ═══ */}
          <section className="py-10 border-y border-primary/8 bg-gradient-to-r from-primary/3 via-transparent to-secondary/3">
            <motion.div
              variants={stagger}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-50px" }}
              className="mx-auto max-w-5xl flex flex-wrap justify-center gap-6 sm:gap-0 sm:divide-x sm:divide-primary/10"
            >
              <StatCounter value="2,847" label="Missions ce mois" />
              <StatCounter value="47" label="Secondes en moyenne" suffix="s" />
              <StatCounter value="98" label="Satisfaction client" suffix="%" />
              <StatCounter value="0" label="Frais d'inscription" suffix="€" />
            </motion.div>
          </section>

          {/* ═══ FEATURES BENTO ═══ */}
          <section id="features" className="py-24 px-6">
            <div className="mx-auto max-w-7xl">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="text-center mb-16"
              >
                <Badge variant="quiet" className="mb-4 text-xs bg-primary/8 text-primary border-primary/10">Comment ça marche</Badge>
                <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground mb-4">
                  De l&apos;urgence à la solution.{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">En quelques minutes.</span>
                </h2>
                <p className="text-lg text-muted-foreground max-w-xl mx-auto">
                  Tout ce dont un directeur d&apos;établissement a besoin, dans une seule interface.
                </p>
              </motion.div>

              <motion.div
                variants={stagger}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-80px" }}
                className="grid grid-cols-1 md:grid-cols-3 gap-4"
              >
                <FeatureCard
                  icon={Zap}
                  title="Publication instantanée"
                  description="Décrivez votre besoin en 30 secondes. Notre algorithme alerte immédiatement les profils qualifiés autour de votre établissement."
                  variant="coral"
                  large
                />
                <FeatureCard
                  icon={Users}
                  title="Matching intelligent"
                  description="Diplômes, disponibilités, distance, avis. On filtre pour vous — vous choisissez en un clic."
                  variant="azure"
                />
                <FeatureCard
                  icon={Clock}
                  title="Confirmation temps réel"
                  description="Le professionnel postule, vous confirmez. Pas de mail. Pas de téléphone. 47 secondes en moyenne."
                  variant="coral"
                />
                <FeatureCard
                  icon={FileText}
                  title="Contrats auto-générés"
                  description="Chaque mission génère automatiquement son contrat, ses relevés d'heures et sa facture."
                  variant="azure"
                />
                <FeatureCard
                  icon={ShieldCheck}
                  title="Profils 100% vérifiés"
                  description="Diplômes, ADELI/RPPS, expérience, avis des pairs. Zéro risque pour votre établissement."
                  variant="coral"
                />
              </motion.div>
            </div>
          </section>

          {/* ═══ FREELANCE SECTION ═══ */}
          <section id="freelances" className="py-24 px-6">
            <div className="mx-auto max-w-7xl">
              {/* Sublime gradient border */}
              <div className="relative rounded-[2rem] p-[1.5px] overflow-hidden bg-gradient-to-br from-primary/50 via-primary/10 to-secondary/50">
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 via-transparent to-secondary/20 animate-pulse" style={{ animationDuration: "4s" }} />

                <div className="relative rounded-[calc(2rem-1.5px)] bg-gradient-to-br from-white/90 via-white/80 to-white/90 backdrop-blur-xl overflow-hidden">
                  {/* Decorative blobs */}
                  <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
                  <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-secondary/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />

                  <div className="relative z-10 p-8 sm:p-14 lg:p-20">
                    <div className="flex flex-col lg:flex-row items-start gap-12 lg:gap-20">
                      <div className="flex-1 space-y-6 max-w-xl">
                        <Badge variant="info" className="text-xs font-bold">Espace Indépendants</Badge>

                        <h2 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-extrabold tracking-tight text-foreground leading-tight">
                          Votre talent mérite mieux qu&apos;un{" "}
                          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary/80 to-secondary">
                            planning vide.
                          </span>
                        </h2>

                        <p className="text-lg text-muted-foreground leading-relaxed">
                          Rejoignez un réseau de soignants indépendants qui choisissent leurs missions,
                          leurs horaires et maximisent leurs revenus — sans aucune paperasse.
                        </p>

                        <ul className="space-y-3.5 pt-2">
                          {[
                            { icon: Zap, text: "Fast-Apply : postulez en 1 seconde, sans CV" },
                            { icon: FileText, text: "Factures et contrats générés automatiquement" },
                            { icon: TrendingUp, text: "Proposez vos ateliers et formations sur la marketplace" },
                            { icon: DollarSign, text: "Paiement garanti sous 72h après validation" },
                          ].map((item, i) => (
                            <li key={i} className="flex items-start gap-3">
                              <div className="h-6 w-6 rounded-lg bg-gradient-to-br from-primary/15 to-primary/5 flex items-center justify-center shrink-0 mt-0.5">
                                <item.icon className="h-3.5 w-3.5 text-primary" />
                              </div>
                              <span className="text-sm font-medium text-foreground/90">{item.text}</span>
                            </li>
                          ))}
                        </ul>

                        <div className="pt-4 flex flex-col sm:flex-row gap-3">
                          <Button asChild size="lg" className="h-13 px-7 text-base font-bold rounded-xl shadow-xl shadow-primary/20 bg-gradient-to-r from-primary to-primary/85">
                            <Link href="/register?role=TALENT">
                              Créer mon profil gratuit
                              <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                          </Button>
                        </div>
                        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">
                          Commission 0% · 100 premières inscriptions
                        </p>
                      </div>

                      {/* Floating dashboard mockup */}
                      <div className="flex-1 w-full hidden lg:block" aria-hidden="true">
                        <motion.div
                          initial={{ opacity: 0, y: 40, rotate: 2 }}
                          whileInView={{ opacity: 1, y: 0, rotate: 1 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.8, ease: "easeOut" as const }}
                          className="glass-coral rounded-2xl p-6 shadow-2xl"
                        >
                          <div className="flex items-center justify-between mb-5 pb-4 border-b border-primary/8">
                            <div className="flex items-center gap-2">
                              <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                                <TrendingUp className="h-3.5 w-3.5 text-primary" />
                              </div>
                              <div>
                                <div className="h-2.5 w-20 rounded-full bg-foreground/50" />
                                <div className="h-2 w-14 rounded-full bg-muted-foreground/25 mt-1.5" />
                              </div>
                            </div>
                            <Badge variant="success" className="text-[9px]">En ligne</Badge>
                          </div>

                          <div className="grid grid-cols-3 gap-2.5 mb-5">
                            {[
                              { label: "CA mois", val: "2 840€", color: "text-emerald-600" },
                              { label: "Missions", val: "12", color: "text-foreground" },
                              { label: "Note", val: "4.9★", color: "text-amber-600" },
                            ].map((kpi, i) => (
                              <div key={i} className="rounded-xl bg-white/60 border border-primary/8 p-3">
                                <p className="text-[9px] text-muted-foreground mb-0.5">{kpi.label}</p>
                                <p className={`text-sm font-bold ${kpi.color}`}>{kpi.val}</p>
                              </div>
                            ))}
                          </div>

                          {[
                            { type: "IDE", place: "EHPAD Les Oliviers", pay: "320€", urgent: true },
                            { type: "AS", place: "Clinique Saint-Joseph", pay: "245€", urgent: false },
                          ].map((m, i) => (
                            <div key={i} className="rounded-xl bg-white/60 border border-primary/8 p-3.5 mb-2.5 flex items-center gap-3">
                              <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${m.urgent ? "bg-gradient-to-br from-primary/20 to-primary/5" : "bg-muted/50"}`}>
                                <CalendarDays className={`h-4 w-4 ${m.urgent ? "text-primary" : "text-muted-foreground"}`} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <p className="text-xs font-bold text-foreground">{m.type}</p>
                                  {m.urgent && <Badge variant="error" className="text-[8px] px-1 py-0 h-3.5">SOS</Badge>}
                                </div>
                                <p className="text-[10px] text-muted-foreground truncate">{m.place}</p>
                              </div>
                              <span className="text-xs font-bold text-emerald-600 shrink-0">{m.pay}</span>
                            </div>
                          ))}
                        </motion.div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ═══ TESTIMONIALS ═══ */}
          <section id="testimonials" className="py-24 px-6">
            <div className="mx-auto max-w-7xl">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center mb-16"
              >
                <Badge variant="quiet" className="mb-4 text-xs bg-secondary/8 text-secondary border-secondary/10">Ce qu&apos;ils en disent</Badge>
                <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground mb-4">
                  Adopté par des centaines{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary to-primary">d&apos;établissements.</span>
                </h2>
                <p className="text-lg text-muted-foreground">
                  Directeurs, cadres de santé et professionnels nous font confiance.
                </p>
              </motion.div>

              <motion.div
                variants={stagger}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-80px" }}
                className="grid grid-cols-1 md:grid-cols-3 gap-5"
              >
                <TestimonialCard
                  quote="On est passé de 4 heures de téléphone à 47 secondes pour trouver un remplacement. Les Extras a littéralement sauvé nos week-ends."
                  name="Dr. Marie-Claire Dubois"
                  role="Directrice · EHPAD La Résidence du Parc"
                  rating={5}
                />
                <TestimonialCard
                  quote="L'interface est d'une clarté absolue. Mes cadres n'ont eu besoin d'aucune formation. C'est publier, cliquer, terminé."
                  name="Thomas Bergeron"
                  role="DRH · Groupe Santé Horizon"
                  rating={5}
                />
                <TestimonialCard
                  quote="En 3 mois, j'ai doublé mes revenus. Le Fast-Apply et la facturation automatique me laissent me concentrer sur mes patients."
                  name="Sophie Martin"
                  role="Infirmière IDE · Freelance"
                  rating={5}
                />
              </motion.div>
            </div>
          </section>

          {/* ═══ FINAL CTA ═══ */}
          <section className="py-24 px-6">
            <div className="mx-auto max-w-4xl text-center">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="relative rounded-3xl overflow-hidden"
              >
                {/* Sublime coral-to-azure gradient background */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-white to-secondary/8" />
                <div className="absolute inset-0 glass-coral" />

                <div className="relative z-10 p-10 sm:p-16">
                  <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground mb-4">
                    Prêt à ne plus jamais{" "}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                      manquer de personnel ?
                    </span>
                  </h2>
                  <p className="text-lg text-muted-foreground max-w-lg mx-auto mb-8">
                    Rejoignez les établissements qui ont déjà automatisé leur recrutement de renforts.
                  </p>
                  <div className="flex flex-col sm:flex-row justify-center gap-3">
                    <Button asChild size="lg" className="h-14 px-8 text-lg font-bold rounded-xl shadow-xl shadow-primary/20 bg-gradient-to-r from-primary to-primary/85">
                      <Link href="/register?role=CLIENT">
                        Commencer gratuitement
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Link>
                    </Button>
                    <Button asChild size="lg" variant="outline" className="h-14 px-8 text-lg font-semibold rounded-xl border-secondary/20 text-secondary hover:bg-secondary/5">
                      <Link href="/register?role=TALENT">
                        Espace indépendant
                        <ArrowUpRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                  <p className="mt-6 text-xs text-muted-foreground font-medium">
                    Pas de carte bancaire · Mise en route en 2 min · Support prioritaire
                  </p>
                </div>
              </motion.div>
            </div>
          </section>
        </main>

        {/* ═══ FOOTER ═══ */}
        <footer className="border-t border-primary/8 py-12 px-6 bg-gradient-to-b from-transparent to-primary/3">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-col md:flex-row justify-between items-start gap-10 mb-10">
              <div className="max-w-xs">
                <Link href="/" className="flex items-center gap-2 mb-4">
                  <Image src="/logo-adepa.png" alt="ADEPA Les Extras" width={100} height={34} className="h-8 w-auto object-contain" />
                </Link>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  La plateforme premium de mise en relation médico-sociale en temps réel.
                </p>
              </div>

              <div className="flex gap-16">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Plateforme</p>
                  <ul className="space-y-2">
                    <li><Link href="/login" className="text-sm text-muted-foreground hover:text-primary transition-colors">Se connecter</Link></li>
                    <li><Link href="/register" className="text-sm text-muted-foreground hover:text-primary transition-colors">Inscription</Link></li>
                  </ul>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Légal</p>
                  <ul className="space-y-2">
                    <li><Link href="/privacy" className="text-sm text-muted-foreground hover:text-primary transition-colors">Confidentialité</Link></li>
                    <li><Link href="/terms" className="text-sm text-muted-foreground hover:text-primary transition-colors">CGU</Link></li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-primary/8 flex flex-col sm:flex-row justify-between items-center gap-4">
              <p className="text-xs text-muted-foreground">© 2026 ADEPA — Les Extras. Tous droits réservés.</p>
              <p className="text-xs text-muted-foreground">Fait avec ❤️ pour le médico-social français</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import Image from "next/image";
import {
  motion, useScroll, useTransform, useMotionValue, useSpring,
} from "framer-motion";
import { useRef, useCallback } from "react";
import {
  ArrowRight, CheckCircle, ShieldCheck, Clock, Star, Zap,
  TrendingUp, Users, BadgeCheck, ArrowUpRight, CalendarDays,
  FileText, DollarSign, Heart, Briefcase, Lock, Play,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatedNumber } from "@/components/ui/animated-number";
import { TextReveal } from "@/components/ui/text-reveal";
import { Marquee } from "@/components/ui/marquee";
import {
  EASE_PREMIUM, EASE_SNAPPY, SPRING_BOUNCY, SPRING_SOFT,
  STAGGER_DEFAULT, STAGGER_FAST,
} from "@/lib/motion";

/* --- constants --- */
const DISPLAY = "font-[family-name:var(--font-display)]";
const MONO    = "font-[family-name:var(--font-mono)]";

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: STAGGER_DEFAULT, delayChildren: 0.08 } },
};
const rise = {
  hidden: { opacity: 0, y: 28, filter: "blur(6px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.6, ease: EASE_PREMIUM } },
};
const slideUp = {
  hidden: { opacity: 0, y: 60 },
  show: (i: number) => ({ opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE_PREMIUM, delay: i * 0.08 } }),
};

/* --- shared sub-components --- */

function Tilt({ children, className }: { children: React.ReactNode; className?: string }) {
  const el = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0), my = useMotionValue(0);
  const rx = useSpring(useTransform(my, [-0.5, 0.5], [4, -4]), { stiffness: 240, damping: 30 });
  const ry = useSpring(useTransform(mx, [-0.5, 0.5], [-4, 4]), { stiffness: 240, damping: 30 });
  const move = useCallback((e: React.MouseEvent) => {
    if (!el.current) return;
    const r = el.current.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  }, [mx, my]);
  const leave = useCallback(() => { mx.set(0); my.set(0); }, [mx, my]);
  return (
    <motion.div ref={el} style={{ rotateX: rx, rotateY: ry, transformPerspective: 1200 }}
      onMouseMove={move} onMouseLeave={leave} className={className}>
      {children}
    </motion.div>
  );
}

function Blob({ className, d = 0 }: { className: string; d?: number }) {
  return (
    <motion.div className={className}
      animate={{ x: [0, 24, -18, 0], y: [0, -20, 14, 0], scale: [1, 1.06, 0.95, 1] }}
      transition={{ duration: 25, delay: d, repeat: Infinity, ease: "easeInOut" }} />
  );
}

/* --- Floating notification cards for hero --- */
function FloatingCard({ children, className, delay = 0 }: {
  children: React.ReactNode; className?: string; delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.9, rotate: 0 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.8, type: "spring", stiffness: 80 }}
      className={className}
    >
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 4, delay: delay + 0.5, repeat: Infinity, ease: "easeInOut" }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

/* --- Bento feature card --- */
function BentoCard({ icon: Icon, title, desc, accent = "teal", className }: {
  icon: React.ComponentType<{ className?: string }>;
  title: string; desc: string; accent?: "teal" | "coral" | "violet" | "sand" | "emerald";
  className?: string;
}) {
  const colors = {
    teal:    { bg: "icon-teal",    ring: "ring-[hsl(var(--teal)/0.12)]",    orb: "from-[hsl(var(--teal)/0.15)]" },
    coral:   { bg: "icon-coral",   ring: "ring-[hsl(var(--coral)/0.12)]",   orb: "from-[hsl(var(--coral)/0.12)]" },
    violet:  { bg: "icon-violet",  ring: "ring-[hsl(var(--violet)/0.12)]",  orb: "from-[hsl(var(--violet)/0.12)]" },
    sand:    { bg: "icon-sand",    ring: "ring-[hsl(var(--sand)/0.12)]",    orb: "from-[hsl(var(--sand)/0.12)]" },
    emerald: { bg: "icon-emerald", ring: "ring-[hsl(var(--emerald)/0.12)]", orb: "from-[hsl(var(--emerald)/0.12)]" },
  } as const;
  const c = colors[accent];
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mouse-x", `${e.clientX - rect.left}px`);
    e.currentTarget.style.setProperty("--mouse-y", `${e.clientY - rect.top}px`);
  }, []);
  return (
    <motion.div variants={rise} className={className}>
      <Tilt className="group relative overflow-hidden rounded-[20px] p-6 sm:p-8 h-full
        glass-panel card-spotlight border border-white/20 shadow-glass
        transition-all duration-500 hover:-translate-y-2 hover:shadow-glass-lg hover:border-white/35 cursor-default">
        <div className={`absolute -top-20 -right-20 h-52 w-52 rounded-full blur-[80px] opacity-0
          group-hover:opacity-100 transition-opacity duration-700 bg-gradient-to-br ${c.orb} to-transparent`} />
        <div className="relative z-10 flex flex-col h-full" onMouseMove={handleMouseMove}>
          <motion.div whileHover={{ rotate: [0, -6, 6, 0], scale: 1.12 }} transition={SPRING_BOUNCY}
            className={`h-11 w-11 rounded-xl flex items-center justify-center mb-5 ring-1 ${c.bg} ${c.ring}`}>
            <Icon className="h-5 w-5" />
          </motion.div>
          <h3 className={`${DISPLAY} font-bold text-foreground mb-2 text-[15px] leading-snug`}>{title}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
        </div>
      </Tilt>
    </motion.div>
  );
}

/* --- Testimonial card (for marquee) --- */
function TestimonialCard({ quote, name, role, initials, color }: {
  quote: string; name: string; role: string; initials: string; color: string;
}) {
  return (
    <div className="w-[340px] shrink-0 glass-panel border border-white/20 shadow-glass rounded-2xl p-6 flex flex-col gap-4 cursor-default
      hover:shadow-glass-lg hover:-translate-y-1 transition-all duration-300">
      <div className="flex gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} className="h-3.5 w-3.5 fill-[hsl(var(--amber))] text-[hsl(var(--amber))]" />
        ))}
      </div>
      <p className="text-sm text-foreground/80 leading-relaxed">&ldquo;{quote}&rdquo;</p>
      <div className="flex items-center gap-3 pt-2 border-t border-white/10">
        <div className={`h-9 w-9 rounded-full ${color} flex items-center justify-center text-white text-xs font-bold shrink-0`}>
          {initials}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground truncate">{name}</p>
          <p className="text-xs text-muted-foreground truncate">{role}</p>
        </div>
      </div>
    </div>
  );
}

/* ================================================================= */
/*                       MAIN PAGE                                    */
/* ================================================================= */

export default function HomePage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const heroScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.96]);
  const heroO = useTransform(scrollYProgress, [0, 0.35], [1, 0]);

  return (
    <div className="relative min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* -- ambient layers -- */}
      <div className="pointer-events-none fixed inset-0 z-0 dot-grid opacity-60" aria-hidden="true" />
      <div className="pointer-events-none fixed inset-0 z-0" aria-hidden="true">
        <Blob className="absolute -top-32 right-[8%] w-[800px] h-[800px] rounded-full bg-gradient-to-br from-[hsl(var(--teal)/0.07)] to-transparent blur-[100px]" d={0} />
        <Blob className="absolute top-[50%] -left-32 w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-[hsl(var(--coral)/0.05)] to-transparent blur-[100px]" d={8} />
        <Blob className="absolute bottom-[10%] right-[25%] w-[500px] h-[500px] rounded-full bg-gradient-to-tl from-[hsl(var(--violet)/0.04)] to-transparent blur-[100px]" d={14} />
      </div>

      <div className="relative z-10">

        {/* ========== NAVBAR ========== */}
        <motion.header initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, ease: EASE_SNAPPY }} className="fixed top-0 z-50 w-full">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-3">
            <nav className="flex h-14 items-center justify-between rounded-2xl glass-panel-dense border border-white/20 px-5 shadow-glass">
              <Link href="/" className="shrink-0">
                <Image src="/logo-adepa.png" alt="ADEPA Les Extras" width={110} height={36}
                  className="h-8 w-auto object-contain" priority />
              </Link>
              <div className="hidden md:flex items-center gap-8">
                {[
                  { l: "Plateforme", h: "#fonctionnalites" },
                  { l: "Ind\u00e9pendants", h: "#independants" },
                  { l: "T\u00e9moignages", h: "#temoignages" },
                ].map(n => (
                  <Link key={n.l} href={n.h}
                    className="text-[13px] font-medium text-muted-foreground hover:text-foreground transition-colors relative group">
                    {n.l}
                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-[hsl(var(--teal))] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </Link>
                ))}
              </div>
              <div className="flex items-center gap-2.5">
                <Button asChild variant="ghost" size="sm" className="text-[13px] font-semibold hidden sm:inline-flex hover:bg-white/50">
                  <Link href="/login">Connexion</Link>
                </Button>
                <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} transition={SPRING_BOUNCY}>
                  <Button asChild size="sm" variant="coral" className="rounded-xl shadow-sm">
                    <Link href="/register">D\u00e9marrer <ArrowRight className="ml-1 h-3.5 w-3.5" /></Link>
                  </Button>
                </motion.div>
              </div>
            </nav>
          </div>
        </motion.header>

        <main>

          {/* ========== HERO -- CENTERED, CINEMATIC ========== */}
          <section ref={heroRef} className="relative min-h-[100svh] flex flex-col items-center justify-center pt-24 pb-16 px-6">
            <motion.div style={{ y: heroY, scale: heroScale, opacity: heroO }}
              className="mx-auto max-w-4xl w-full text-center">

              {/* pre-heading -- TextReveal stagger */}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1, duration: 0.4 }}
                className="mb-6">
                <TextReveal
                  as="p"
                  delay={0.15}
                  stagger={STAGGER_FAST}
                  className={`${MONO} text-xs sm:text-[13px] font-medium text-[hsl(var(--teal))] justify-center tracking-wide uppercase`}
                >
                  Le rempla\u00e7ant id\u00e9al. En temps r\u00e9el.
                </TextReveal>
              </motion.div>

              {/* main headline -- split word stagger */}
              <div className="overflow-hidden">
                {["Vos absences", "couvertes en", "47 secondes."].map((line, lineIdx) => (
                  <div key={lineIdx} className="overflow-hidden">
                    <motion.div
                      initial={{ y: "100%", opacity: 0 }}
                      animate={{ y: "0%", opacity: 1 }}
                      transition={{ duration: 0.8, delay: 0.3 + lineIdx * 0.12, ease: EASE_PREMIUM }}
                    >
                      <h1 className={`${DISPLAY} text-[clamp(2.8rem,7.5vw,5.8rem)] font-extrabold tracking-[-0.03em] leading-[1.05]
                        ${lineIdx === 2
                          ? "text-gradient-brand"
                          : "text-foreground"
                        }`}>
                        {line}
                      </h1>
                    </motion.div>
                  </div>
                ))}
              </div>

              {/* subtitle */}
              <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.75, ease: EASE_PREMIUM }}
                className="mt-7 text-lg sm:text-xl text-muted-foreground max-w-xl mx-auto leading-relaxed">
                Publiez un besoin en <strong className="text-foreground">30s</strong>.
                Des soignants v\u00e9rifi\u00e9s postulent <strong className="text-foreground">instantan\u00e9ment</strong>.
                Contrats et facturation <strong className="text-foreground">100% automatis\u00e9s</strong>.
              </motion.p>

              {/* CTAs */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.9 }}
                className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                <motion.div whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.97 }} transition={SPRING_BOUNCY}>
                  <Button asChild size="lg" variant="coral"
                    className={`${DISPLAY} h-14 px-10 text-base font-semibold rounded-2xl shadow-xl shadow-[hsl(var(--coral)/0.25)] group`}>
                    <Link href="/register?role=CLIENT">
                      Trouver un renfort
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} transition={SPRING_SOFT}>
                  <Button asChild size="lg" variant="ghost"
                    className={`${DISPLAY} h-14 px-8 text-base font-medium rounded-2xl text-muted-foreground hover:text-foreground group`}>
                    <Link href="#fonctionnalites">
                      <Play className="mr-2 h-4 w-4 text-[hsl(var(--teal))]" />
                      Voir comment \u00e7a marche
                    </Link>
                  </Button>
                </motion.div>
              </motion.div>

              {/* trust badges */}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2, duration: 0.6 }}
                className="mt-10 flex items-center justify-center gap-6 flex-wrap">
                {[
                  { icon: BadgeCheck, label: "Gratuit, sans carte", c: "text-[hsl(var(--emerald))]" },
                  { icon: ShieldCheck, label: "Profils v\u00e9rifi\u00e9s ADELI", c: "text-[hsl(var(--teal))]" },
                  { icon: Lock, label: "RGPD & s\u00e9curis\u00e9", c: "text-muted-foreground" },
                ].map((t, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <t.icon className={`h-3.5 w-3.5 ${t.c}`} />
                    <span>{t.label}</span>
                  </div>
                ))}
              </motion.div>
            </motion.div>

            {/* -- floating notification cards (hero illustration) -- */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
              {/* card 1 -- top-right */}
              <FloatingCard delay={1.0}
                className="absolute top-[18%] right-[6%] hidden lg:block rotate-3">
                <div className="glass-panel-dense border border-white/25 shadow-glass rounded-2xl px-5 py-4 w-[240px]">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="h-8 w-8 rounded-lg icon-coral flex items-center justify-center">
                      <Briefcase className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-foreground">IDE \u2014 Nuit</p>
                      <p className="text-[10px] text-muted-foreground">EHPAD Les Oliviers</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`${MONO} text-[9px] font-bold bg-[hsl(var(--coral))] text-white px-2 py-0.5 rounded-full`}>URGENT</span>
                    <span className={`${MONO} text-xs font-bold text-[hsl(var(--emerald))]`}>320\u20ac</span>
                  </div>
                </div>
              </FloatingCard>

              {/* card 2 -- bottom-left */}
              <FloatingCard delay={1.4}
                className="absolute bottom-[22%] left-[4%] hidden lg:block -rotate-2">
                <div className="glass-panel-dense border border-white/25 shadow-glass rounded-2xl px-5 py-3.5 flex items-center gap-3">
                  <motion.div animate={{ rotate: [0, 360] }} transition={{ delay: 2.2, duration: 0.5 }}>
                    <CheckCircle className="h-5 w-5 text-[hsl(var(--emerald))]" />
                  </motion.div>
                  <div>
                    <p className="text-xs font-bold text-[hsl(var(--emerald))]">Mission confirm\u00e9e</p>
                    <p className={`${MONO} text-[10px] text-muted-foreground`}>Temps de match : 47s</p>
                  </div>
                </div>
              </FloatingCard>

              {/* card 3 -- right-center */}
              <FloatingCard delay={1.8}
                className="absolute top-[55%] right-[3%] hidden xl:block rotate-1">
                <div className="glass-panel-dense border border-white/25 shadow-glass rounded-2xl px-4 py-3 w-[200px]">
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="h-7 w-7 rounded-full bg-gradient-to-br from-[hsl(var(--teal))] to-[hsl(var(--teal)/0.7)] flex items-center justify-center">
                      <Users className="h-3.5 w-3.5 text-white" />
                    </div>
                    <div>
                      <p className={`${MONO} text-[10px] text-muted-foreground`}>Candidatures</p>
                      <p className="text-sm font-bold text-foreground">12 profils</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {[98, 94, 91, 87].map((score, i) => (
                      <motion.div key={i}
                        initial={{ scaleY: 0 }} animate={{ scaleY: 1 }}
                        transition={{ delay: 2.2 + i * 0.1, type: "spring", stiffness: 200 }}
                        className="flex-1 rounded-full origin-bottom"
                        style={{ height: `${score * 0.3}px`, background: `hsl(var(--teal) / ${0.2 + i * 0.15})` }}
                      />
                    ))}
                  </div>
                </div>
              </FloatingCard>
            </div>
          </section>

          {/* ========== SOCIAL PROOF MARQUEE ========== */}
          <section className="py-6 border-y border-white/10">
            <Marquee speed={30} pauseOnHover fade>
              {[
                { v: "2 847", l: "missions ce mois" },
                { v: "47s", l: "temps de match moyen" },
                { v: "98%", l: "taux de satisfaction" },
                { v: "4.9\u2605", l: "note moyenne" },
                { v: "0\u20ac", l: "frais d'inscription" },
                { v: "24/7", l: "matching en continu" },
                { v: "+500", l: "\u00e9tablissements actifs" },
                { v: "72h", l: "paiement garanti" },
              ].map((s, i) => (
                <div key={i} className="flex items-center gap-3 px-4">
                  <span className={`${MONO} text-lg sm:text-xl font-bold text-foreground tabular-nums`}>{s.v}</span>
                  <span className="text-xs text-muted-foreground uppercase tracking-wider">{s.l}</span>
                </div>
              ))}
            </Marquee>
          </section>

          {/* ========== FEATURES -- BENTO GRID ========== */}
          <section id="fonctionnalites" className="py-28 px-6">
            <div className="mx-auto max-w-7xl">
              <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
                viewport={{ once: true }} transition={{ duration: 0.4 }} className="text-center mb-16">
                <TextReveal
                  as="h2"
                  className={`${DISPLAY} text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground leading-[1.10] justify-center`}
                >
                  Tout ce qu'il faut. Rien de superflu.
                </TextReveal>
                <motion.p initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ delay: 0.3, duration: 0.5 }}
                  className="mt-5 text-lg text-muted-foreground max-w-lg mx-auto">
                  Une plateforme pens\u00e9e pour la vitesse, la fiabilit\u00e9 et la simplicit\u00e9.
                </motion.p>
              </motion.div>

              <motion.div variants={stagger} initial="hidden" whileInView="show"
                viewport={{ once: true, margin: "-40px" }}
                className="grid grid-cols-1 md:grid-cols-6 gap-4 auto-rows-[minmax(200px,auto)]">
                {/* row 1 -- hero card (span 4) + tall card (span 2, row-span 2) */}
                <BentoCard icon={Zap} title="Publication instantan\u00e9e"
                  desc="D\u00e9crivez votre besoin en 30 secondes. Notre IA alerte les profils qualifi\u00e9s dans un rayon de 30 km, en priorit\u00e9 selon la compatibilit\u00e9."
                  accent="teal" className="md:col-span-4" />
                <BentoCard icon={Users} title="Matching intelligent"
                  desc="Dipl\u00f4mes, disponibilit\u00e9s, distance, avis et historique. L'algorithme filtre \u2014 vous choisissez en un clic."
                  accent="violet" className="md:col-span-2 md:row-span-2" />
                {/* row 2 -- two equal cards (span 2 each) */}
                <BentoCard icon={Clock} title="47 secondes"
                  desc="Temps moyen entre la publication et la confirmation du rempla\u00e7ant. Record : 11 secondes."
                  accent="coral" className="md:col-span-2" />
                <BentoCard icon={FileText} title="Z\u00e9ro paperasse"
                  desc="Contrats, relev\u00e9s d'heures et factures g\u00e9n\u00e9r\u00e9s automatiquement. Conformit\u00e9 totale."
                  accent="sand" className="md:col-span-2" />
                {/* row 3 -- wide card (span 3) + wide card (span 3) */}
                <BentoCard icon={ShieldCheck} title="Profils 100% v\u00e9rifi\u00e9s"
                  desc="Chaque professionnel est v\u00e9rifi\u00e9 : dipl\u00f4mes, ADELI/RPPS, casier judiciaire, r\u00e9f\u00e9rences et avis."
                  accent="emerald" className="md:col-span-3" />
                <BentoCard icon={DollarSign} title="Paiement s\u00e9curis\u00e9 sous 72h"
                  desc="Les ind\u00e9pendants sont pay\u00e9s automatiquement. Transparence totale, z\u00e9ro commission sur les 100 premi\u00e8res missions."
                  accent="teal" className="md:col-span-3" />
              </motion.div>
            </div>
          </section>

          {/* ========== HOW IT WORKS -- 3 STEPS ========== */}
          <section className="py-24 px-6 relative overflow-hidden">
            <div className="absolute inset-0 mesh-gradient opacity-50" />
            <div className="relative z-10 mx-auto max-w-6xl">
              <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
                viewport={{ once: true }} className="text-center mb-20">
                <TextReveal
                  as="h2"
                  className={`${DISPLAY} text-2xl sm:text-[2.75rem] font-extrabold text-foreground leading-[1.15] justify-center`}
                >
                  3 clics. Z\u00e9ro friction. C'est parti.
                </TextReveal>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
                {/* connecting line */}
                <div className="hidden md:block absolute top-16 left-[20%] right-[20%] line-glow z-0" />
                {[
                  { n: "01", title: "Publiez", desc: "Poste, date, cr\u00e9neau. Formulaire guid\u00e9, 30 secondes chrono.", icon: CalendarDays },
                  { n: "02", title: "Recevez", desc: "Les soignants qualifi\u00e9s \u00e0 proximit\u00e9 postulent instantan\u00e9ment.", icon: Users },
                  { n: "03", title: "Confirmez", desc: "Un clic. Contrat sign\u00e9, acc\u00e8s cr\u00e9\u00e9s, mission lanc\u00e9e.", icon: CheckCircle },
                ].map((step, i) => (
                  <motion.div key={i} custom={i} variants={slideUp} initial="hidden" whileInView="show"
                    viewport={{ once: true, margin: "-30px" }} className="relative z-10">
                    <div className="relative glass-panel border border-white/20 shadow-glass rounded-2xl p-7 sm:p-8
                      hover:shadow-glass-lg hover:-translate-y-1 transition-all duration-400">
                      {/* watermark number */}
                      <span className={`absolute top-4 right-6 ${MONO} text-[5rem] font-extrabold text-outline leading-none select-none`}>
                        {step.n}
                      </span>
                      <div className="relative z-10">
                        <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-[hsl(var(--teal))] to-[hsl(var(--teal)/0.7)] flex items-center justify-center mb-6 shadow-md">
                          <step.icon className="h-5 w-5 text-white" />
                        </div>
                        <h3 className={`${DISPLAY} text-xl font-bold text-foreground mb-2`}>{step.title}</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* ========== STATS -- FULL-WIDTH GLASS ========== */}
          <section className="py-16 px-6">
            <div className="mx-auto max-w-6xl">
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.6 }}
                className="glass-panel border border-white/20 shadow-glass-lg rounded-2xl p-8 sm:p-10">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-0 md:divide-x md:divide-white/10">
                  {[
                    { value: 2847, label: "Missions ce mois", suffix: "" },
                    { value: 47, label: "Secondes de match", suffix: "s" },
                    { value: 98, label: "Taux de satisfaction", suffix: "%" },
                    { value: 0, label: "Frais d'inscription", suffix: "\u20ac" },
                  ].map((stat, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.5 }}
                      className="flex flex-col items-center gap-1.5 px-4">
                      <span className={`${MONO} text-4xl sm:text-5xl font-bold tabular-nums tracking-tight text-foreground`}>
                        <AnimatedNumber value={stat.value} />
                        {stat.suffix && <span className="text-[hsl(var(--teal))]">{stat.suffix}</span>}
                      </span>
                      <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.2em] text-center">{stat.label}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          </section>

          {/* ========== FREELANCE SECTION ========== */}
          <section id="independants" className="py-28 px-6">
            <div className="mx-auto max-w-7xl">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 rounded-[24px] overflow-hidden shadow-glass-lg border border-white/15">
                {/* left -- dark teal panel */}
                <div className="relative bg-gradient-to-br from-[hsl(var(--teal))] via-[hsl(var(--teal)/0.95)] to-[hsl(var(--teal)/0.85)] p-8 sm:p-12 flex flex-col justify-center">
                  <div className="absolute inset-0 grain opacity-30 pointer-events-none" />
                  <div className="absolute top-0 right-0 w-[300px] h-[300px] rounded-full bg-white/[0.06] blur-[80px] pointer-events-none" />
                  <div className="relative z-10">
                    <span className={`${MONO} inline-block text-[11px] font-bold text-white/60 uppercase tracking-widest mb-6`}>
                      Espace ind\u00e9pendants
                    </span>
                    <h2 className={`${DISPLAY} text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight mb-5`}>
                      Votre talent m\u00e9rite mieux qu'un planning vide.
                    </h2>
                    <p className="text-base text-white/70 leading-relaxed mb-8 max-w-md">
                      Choisissez vos missions, fixez vos tarifs, d\u00e9veloppez votre activit\u00e9. Le tout sans aucune commission.
                    </p>
                    <div className="space-y-4 mb-8">
                      {[
                        { icon: Zap, text: "Fast-Apply : postulez en 1 seconde" },
                        { icon: FileText, text: "Contrats et factures auto-g\u00e9n\u00e9r\u00e9s" },
                        { icon: TrendingUp, text: "Marketplace pour vos ateliers" },
                        { icon: DollarSign, text: "Paiement garanti sous 72h" },
                      ].map((item, i) => (
                        <motion.div key={i} initial={{ opacity: 0, x: -16 }} whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }} transition={{ delay: 0.15 + i * 0.08, ease: EASE_PREMIUM }}
                          className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center shrink-0">
                            <item.icon className="h-4 w-4 text-white" />
                          </div>
                          <span className="text-sm font-medium text-white/90">{item.text}</span>
                        </motion.div>
                      ))}
                    </div>
                    <motion.div whileHover={{ scale: 1.03, y: -1 }} whileTap={{ scale: 0.97 }} transition={SPRING_BOUNCY}>
                      <Button asChild size="lg"
                        className={`${DISPLAY} h-13 px-8 text-base font-semibold rounded-2xl bg-white text-[hsl(var(--teal))] hover:bg-white/90 shadow-xl group`}>
                        <Link href="/register?role=TALENT">
                          Cr\u00e9er mon profil gratuit
                          <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </Link>
                      </Button>
                    </motion.div>
                    <p className={`${MONO} mt-4 text-[10px] font-semibold text-white/40 uppercase tracking-widest`}>
                      Commission 0% \u00b7 100 premi\u00e8res inscriptions
                    </p>
                  </div>
                </div>

                {/* right -- glass panel with mock stats */}
                <div className="relative glass-panel-dense p-8 sm:p-12 flex items-center" aria-hidden="true">
                  <div className="w-full space-y-5">
                    <div className="flex items-center justify-between pb-5 border-b border-white/10">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[hsl(var(--teal))] to-[hsl(var(--teal)/0.7)] flex items-center justify-center">
                          <TrendingUp className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-foreground">Tableau de bord</p>
                          <p className="text-xs text-muted-foreground">Mars 2026</p>
                        </div>
                      </div>
                      <span className={`${MONO} text-[9px] font-bold text-[hsl(var(--emerald))] px-2.5 py-1 rounded-full border border-[hsl(var(--emerald)/0.2)] bg-[hsl(var(--emerald-light))]`}>
                        En ligne
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { l: "CA mois", v: "2 840\u20ac", c: "text-[hsl(var(--emerald))]" },
                        { l: "Missions", v: "12", c: "text-foreground" },
                        { l: "Note", v: "4.9\u2605", c: "text-[hsl(var(--amber))]" },
                      ].map((k, i) => (
                        <motion.div key={i} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }} transition={{ delay: 0.3 + i * 0.1 }}
                          className="rounded-xl glass-panel-subtle border border-white/15 p-3.5">
                          <p className={`${MONO} text-[10px] text-muted-foreground mb-1`}>{k.l}</p>
                          <p className={`${MONO} text-base font-bold ${k.c}`}>{k.v}</p>
                        </motion.div>
                      ))}
                    </div>
                    {[
                      { t: "IDE", p: "EHPAD Les Oliviers", pay: "320\u20ac", u: true },
                      { t: "AS", p: "Clinique Saint-Joseph", pay: "245\u20ac", u: false },
                      { t: "AES", p: "R\u00e9sidence Le Parc", pay: "210\u20ac", u: false },
                    ].map((m, i) => (
                      <motion.div key={i} initial={{ opacity: 0, x: 16 }} whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }} transition={{ delay: 0.5 + i * 0.12 }}
                        className="rounded-xl glass-panel-subtle border border-white/15 p-4 flex items-center gap-3">
                        <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0
                          ${m.u ? "icon-coral" : "icon-teal"}`}>
                          <CalendarDays className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-bold text-foreground">{m.t}</p>
                            {m.u && <span className={`${MONO} text-[8px] font-bold bg-[hsl(var(--coral))] text-white px-1.5 py-0.5 rounded-full`}>URGENT</span>}
                          </div>
                          <p className="text-xs text-muted-foreground truncate">{m.p}</p>
                        </div>
                        <span className={`${MONO} text-sm font-bold text-[hsl(var(--emerald))] shrink-0`}>{m.pay}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ========== TESTIMONIALS -- DOUBLE MARQUEE ========== */}
          <section id="temoignages" className="py-24 overflow-hidden">
            <div className="mx-auto max-w-7xl px-6 mb-14">
              <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
                viewport={{ once: true }} className="text-center">
                <TextReveal
                  as="h2"
                  className={`${DISPLAY} text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground leading-tight justify-center`}
                >
                  Ils l'utilisent au quotidien.
                </TextReveal>
                <motion.p initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ delay: 0.3 }}
                  className="mt-4 text-lg text-muted-foreground">
                  +500 \u00e9tablissements et soignants ind\u00e9pendants font confiance \u00e0 Les Extras.
                </motion.p>
              </motion.div>
            </div>

            {/* row 1 */}
            <Marquee speed={45} pauseOnHover fade>
              <TestimonialCard
                quote="On est pass\u00e9 de 4h de t\u00e9l\u00e9phone \u00e0 47 secondes. Les Extras a litt\u00e9ralement sauv\u00e9 nos week-ends."
                name="Dr. Marie-Claire Dubois" role="Directrice \u00b7 EHPAD La R\u00e9sidence du Parc"
                initials="MD" color="bg-[hsl(var(--teal))]" />
              <TestimonialCard
                quote="Interface d'une clart\u00e9 absolue. Mes cadres n'ont eu besoin d'aucune formation."
                name="Thomas Bergeron" role="DRH \u00b7 Groupe Sant\u00e9 Horizon"
                initials="TB" color="bg-[hsl(var(--violet))]" />
              <TestimonialCard
                quote="En 3 mois j'ai doubl\u00e9 mes revenus. Le Fast-Apply me laisse me concentrer sur mes patients."
                name="Sophie Martin" role="Infirmi\u00e8re IDE \u00b7 Freelance"
                initials="SM" color="bg-[hsl(var(--coral))]" />
              <TestimonialCard
                quote="Le matching est bluffant \u2014 les profils propos\u00e9s correspondent toujours parfaitement \u00e0 nos besoins."
                name="Philippe Renard" role="Directeur \u00b7 Clinique du Lac"
                initials="PR" color="bg-[hsl(var(--sand))]" />
              <TestimonialCard
                quote="Z\u00e9ro paperasse. Les contrats et factures se g\u00e9n\u00e8rent tout seuls. Un gain de temps incroyable."
                name="Camille Lef\u00e8vre" role="Cadre de sant\u00e9 \u00b7 CHU Bordeaux"
                initials="CL" color="bg-[hsl(var(--emerald))]" />
            </Marquee>

            {/* row 2 -- reverse direction */}
            <div className="mt-4">
              <Marquee speed={50} pauseOnHover fade reverse>
                <TestimonialCard
                  quote="J'ai choisi Les Extras pour la libert\u00e9. Je travaille quand je veux, o\u00f9 je veux, au tarif que je fixe."
                  name="Julien Moreau" role="Aide-soignant \u00b7 Ind\u00e9pendant"
                  initials="JM" color="bg-[hsl(var(--teal)/0.8)]" />
                <TestimonialCard
                  quote="La r\u00e9activit\u00e9 est incroyable. 47 secondes, ce n'est pas du marketing \u2014 c'est ce qu'on vit au quotidien."
                  name="Nathalie Petit" role="Directrice \u00b7 EHPAD Soleil d'Or"
                  initials="NP" color="bg-[hsl(var(--coral)/0.8)]" />
                <TestimonialCard
                  quote="Le paiement sous 72h change tout. Plus de d\u00e9lais, plus de relances. C'est pro, c'est s\u00e9rieux."
                  name="Alexandre Blanc" role="IDE \u00b7 Freelance"
                  initials="AB" color="bg-[hsl(var(--violet)/0.8)]" />
                <TestimonialCard
                  quote="On a r\u00e9duit notre taux d'absence non-couvert de 23% \u00e0 2%. Les chiffres parlent d'eux-m\u00eames."
                  name="Dr. Isabelle Laurent" role="DG \u00b7 Groupe M\u00e9dicis"
                  initials="IL" color="bg-[hsl(var(--amber))]" />
                <TestimonialCard
                  quote="Mes coll\u00e8gues pensaient que c'\u00e9tait trop beau. Apr\u00e8s 1 mois, elles se sont toutes inscrites."
                  name="Marie Fontaine" role="AES \u00b7 Ind\u00e9pendante"
                  initials="MF" color="bg-[hsl(var(--emerald)/0.8)]" />
              </Marquee>
            </div>
          </section>

          {/* ========== CTA FINAL -- IMMERSIVE ========== */}
          <section className="py-32 px-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--teal))] via-[hsl(var(--teal)/0.92)] to-[hsl(var(--teal)/0.80)] z-0" />
            <div className="absolute inset-0 grain opacity-20 pointer-events-none z-[1]" />
            <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full bg-white/[0.08] blur-[100px] pointer-events-none" />
            <div className="absolute bottom-0 -left-16 w-[400px] h-[400px] rounded-full bg-[hsl(var(--coral)/0.25)] blur-[100px] pointer-events-none" />
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full bg-[hsl(var(--violet)/0.08)] blur-[120px] pointer-events-none" />
            <motion.div animate={{ x: ["-100%", "200%"] }}
              transition={{ duration: 5, repeat: Infinity, repeatDelay: 6, ease: "easeInOut" }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.06] to-transparent skew-x-12 pointer-events-none z-[2]" />

            <div className="relative z-10 mx-auto max-w-3xl text-center text-white">
              <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.7 }}>
                <h2 className={`${DISPLAY} text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6 leading-[1.08]`}>
                  Pr\u00eat \u00e0 ne plus jamais manquer de personnel ?
                </h2>
                <p className="text-lg sm:text-xl text-white/65 max-w-xl mx-auto mb-10 leading-relaxed">
                  Rejoignez les centaines d'\u00e9tablissements qui ont automatis\u00e9 leur recrutement temporaire.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <motion.div whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.97 }} transition={SPRING_BOUNCY}>
                    <Button asChild size="lg"
                      className={`${DISPLAY} h-14 px-10 text-base font-semibold rounded-2xl bg-white text-[hsl(var(--teal))] hover:bg-white/90 shadow-2xl group`}>
                      <Link href="/register?role=CLIENT">
                        Commencer gratuitement
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </Link>
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.03, y: -1 }} whileTap={{ scale: 0.97 }} transition={SPRING_SOFT}>
                    <Button asChild size="lg"
                      className={`${DISPLAY} h-14 px-10 text-base font-semibold rounded-2xl bg-white/10 backdrop-blur-sm text-white border border-white/20 hover:bg-white/20`}>
                      <Link href="/register?role=TALENT">
                        Espace ind\u00e9pendant
                        <ArrowUpRight className="ml-1.5 h-4 w-4" />
                      </Link>
                    </Button>
                  </motion.div>
                </div>
                <p className={`${MONO} mt-8 text-[11px] text-white/40 font-medium tracking-wider`}>
                  Pas de carte bancaire \u00b7 Inscription en 2 min \u00b7 Support premium
                </p>
              </motion.div>
            </div>
          </section>
        </main>

        {/* ========== FOOTER ========== */}
        <footer className="relative py-12 px-6">
          <div className="absolute inset-x-0 top-0 line-glow" />
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-col md:flex-row justify-between items-start gap-10 mb-8">
              <div className="max-w-xs">
                <Link href="/" className="block mb-4">
                  <Image src="/logo-adepa.png" alt="ADEPA Les Extras" width={95} height={30}
                    className="h-7 w-auto object-contain" />
                </Link>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  La plateforme de mise en relation premium pour le m\u00e9dico-social. Matching en temps r\u00e9el.
                </p>
              </div>
              <div className="flex gap-14">
                <div>
                  <p className={`${MONO} text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-3`}>Plateforme</p>
                  <ul className="space-y-2.5">
                    <li><Link href="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Se connecter</Link></li>
                    <li><Link href="/register" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Inscription</Link></li>
                  </ul>
                </div>
                <div>
                  <p className={`${MONO} text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-3`}>L\u00e9gal</p>
                  <ul className="space-y-2.5">
                    <li><Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Confidentialit\u00e9</Link></li>
                    <li><Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">CGU</Link></li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-3">
              <p className={`${MONO} text-xs text-muted-foreground`}>\u00a9 2026 ADEPA \u2014 Les Extras</p>
              <p className={`${MONO} text-xs text-muted-foreground flex items-center gap-1.5`}>
                Fait avec <Heart className="h-3 w-3 fill-[hsl(var(--coral)/0.6)] text-[hsl(var(--coral)/0.6)]" /> pour le m\u00e9dico-social
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
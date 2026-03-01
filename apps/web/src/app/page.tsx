"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, useScroll, useTransform, useMotionValue, useSpring, useInView } from "framer-motion";
import { useRef, useState, useEffect, useCallback } from "react";
import {
  ArrowRight, CheckCircle, ShieldCheck, Clock, Star, Zap, MapPin,
  TrendingUp, Users, Sparkles, BadgeCheck, ArrowUpRight, CalendarDays,
  FileText, DollarSign, ChevronRight, Heart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

/* ─── Animation variants ─── */
const stagger = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.12, delayChildren: 0.2 } } };
const rise = { hidden: { opacity: 0, y: 50 }, show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" as const } } };

/* ─── Animated counter ─── */
function useCounter(target: number, dur = 1400) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const seen = useInView(ref, { once: true, margin: "-40px" });
  useEffect(() => {
    if (!seen) return;
    const t0 = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - t0) / dur, 1);
      setVal(Math.floor((1 - Math.pow(1 - p, 3)) * target));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [seen, target, dur]);
  return { val, ref };
}

/* ─── 3D Tilt card ─── */
function Tilt({ children, className }: { children: React.ReactNode; className?: string }) {
  const el = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0), my = useMotionValue(0);
  const rx = useSpring(useTransform(my, [-0.5, 0.5], [5, -5]), { stiffness: 300, damping: 30 });
  const ry = useSpring(useTransform(mx, [-0.5, 0.5], [-5, 5]), { stiffness: 300, damping: 30 });
  const move = useCallback((e: React.MouseEvent) => {
    if (!el.current) return;
    const r = el.current.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  }, [mx, my]);
  const leave = useCallback(() => { mx.set(0); my.set(0); }, [mx, my]);
  return (
    <motion.div ref={el} style={{ rotateX: rx, rotateY: ry, transformPerspective: 800 }} onMouseMove={move} onMouseLeave={leave} className={className}>
      {children}
    </motion.div>
  );
}

/* ─── Floating Blob ─── */
function Blob({ className, d = 0 }: { className: string; d?: number }) {
  return (
    <motion.div className={className}
      animate={{ x: [0, 30, -20, 0], y: [0, -25, 15, 0], scale: [1, 1.06, 0.96, 1] }}
      transition={{ duration: 22, delay: d, repeat: Infinity, ease: "easeInOut" as const }}
    />
  );
}

/* ─── Hero matching simulation ─── */
function MatchingDemo() {
  return (
    <div className="relative w-full max-w-[440px] mx-auto" aria-hidden="true">
      {/* Mesh glow behind cards */}
      <div className="absolute -inset-16 rounded-[4rem] opacity-60" style={{
        background: "radial-gradient(ellipse at 30% 30%, hsla(4,78%,58%,0.18), transparent 60%), radial-gradient(ellipse at 70% 70%, hsla(220,82%,45%,0.12), transparent 60%)"
      }} />

      {/* Card 1 — Urgent alert */}
      <motion.div
        initial={{ opacity: 0, y: 60, rotate: -4 }}
        animate={{ opacity: 1, y: 0, rotate: -2 }}
        transition={{ delay: 0.5, duration: 0.8, type: "spring", stiffness: 90 }}
      >
        <Tilt className="relative rounded-2xl p-5 glass-coral glow-coral cursor-default">
          <motion.div animate={{ boxShadow: ["0 0 0 0 hsla(4,78%,58%,0)", "0 0 0 10px hsla(4,78%,58%,0.12)", "0 0 0 0 hsla(4,78%,58%,0)"] }}
            transition={{ duration: 2, repeat: Infinity, delay: 1.2 }}
            className="absolute -top-1.5 -right-1.5 h-3.5 w-3.5 rounded-full bg-gradient-to-br from-primary to-red-500"
          />
          <div className="flex items-start gap-3.5">
            <motion.div animate={{ rotate: [0, -10, 10, 0] }} transition={{ duration: 0.6, delay: 0.8 }}
              className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/30 via-primary/15 to-orange-400/10 flex items-center justify-center shrink-0 ring-1 ring-primary/20"
            >
              <Zap className="h-5.5 w-5.5 text-primary" />
            </motion.div>
            <div className="min-w-0 space-y-1.5">
              <div className="flex items-center gap-2">
                <p className="text-sm font-bold text-foreground">Besoin urgent publié</p>
                <span className="inline-flex items-center gap-1 text-[9px] font-bold bg-gradient-to-r from-red-500 to-primary text-white px-2 py-0.5 rounded-full animate-pulse">SOS</span>
              </div>
              <p className="text-xs text-muted-foreground">IDE · EHPAD Les Oliviers · Demain 7h–15h</p>
              <div className="flex items-center gap-4 pt-0.5">
                <span className="flex items-center gap-1 text-[10px] text-muted-foreground"><MapPin className="h-3 w-3" /> Marseille 13</span>
                <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600"><DollarSign className="h-3 w-3" /> 320€ net</span>
              </div>
            </div>
          </div>
        </Tilt>
      </motion.div>

      {/* Card 2 — Match results */}
      <motion.div
        initial={{ opacity: 0, y: 40, x: 30, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, x: 0, scale: 1 }}
        transition={{ delay: 1.6, duration: 0.6, type: "spring", stiffness: 120 }}
        className="mt-3 ml-8"
      >
        <Tilt className="relative rounded-2xl p-4 glass-azure glow-azure cursor-default">
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2.5">
              {[0, 1, 2].map(i => (
                <motion.div key={i} initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.8 + i * 0.15, type: "spring", stiffness: 200 }}
                  className={`h-10 w-10 rounded-full border-2 border-white/80 flex items-center justify-center shadow-sm ${i === 0 ? "bg-gradient-to-br from-secondary/25 to-secondary/10" : i === 1 ? "bg-gradient-to-br from-primary/25 to-primary/10" : "bg-gradient-to-br from-emerald-400/25 to-emerald-400/10"}`}>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </motion.div>
              ))}
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">3 profils compatibles</p>
              <p className="text-[11px] text-muted-foreground">IDE vérifiés · &lt; 12 km</p>
            </div>
          </div>
        </Tilt>
      </motion.div>

      {/* Card 3 — Confirmed */}
      <motion.div
        initial={{ opacity: 0, scale: 0.4, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ delay: 2.5, type: "spring", stiffness: 250, damping: 12 }}
        className="mt-3 ml-16 inline-flex items-center gap-2.5 rounded-full px-5 py-3 shadow-md"
        style={{ background: "linear-gradient(135deg, hsla(145,60%,52%,0.12), hsla(145,60%,52%,0.04))", border: "1px solid hsla(145,60%,52%,0.2)" }}
      >
        <motion.div animate={{ rotate: [0, 360] }} transition={{ delay: 2.7, duration: 0.5 }}>
          <CheckCircle className="h-5 w-5 text-emerald-500" />
        </motion.div>
        <span className="text-sm font-bold text-emerald-700">Mission confirmée</span>
        <span className="text-[10px] text-emerald-600 font-semibold">47s</span>
      </motion.div>
    </div>
  );
}

/* ─── Feature card ─── */
function Feature({ icon: Icon, title, desc, v = "coral", big }: {
  icon: React.ComponentType<{ className?: string }>; title: string; desc: string; v?: "coral" | "azure"; big?: boolean;
}) {
  const azure = v === "azure";
  return (
    <motion.div variants={rise}>
      <Tilt className={`group relative overflow-hidden rounded-3xl p-8 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl cursor-default ${big ? "md:col-span-2 md:row-span-2 md:p-12" : ""} ${azure ? "glass-azure hover:glow-azure" : "glass-coral hover:glow-coral"}`}>
        <div className={`absolute -top-12 -right-12 h-56 w-56 rounded-full blur-3xl opacity-0 group-hover:opacity-25 transition-all duration-700 ${azure ? "bg-secondary" : "bg-primary"}`} />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="relative z-10 flex flex-col h-full">
          <motion.div whileHover={{ rotate: [0, -12, 12, -6, 0], scale: 1.15 }} transition={{ duration: 0.5 }}
            className={`h-14 w-14 rounded-2xl flex items-center justify-center mb-6 ${azure ? "bg-gradient-to-br from-secondary/25 to-secondary/5 ring-1 ring-secondary/15" : "bg-gradient-to-br from-primary/25 via-primary/10 to-orange-400/5 ring-1 ring-primary/15"}`}
          >
            <Icon className={`h-7 w-7 ${azure ? "text-secondary" : "text-primary"}`} />
          </motion.div>
          <h3 className={`font-bold text-foreground mb-2.5 ${big ? "text-2xl" : "text-lg"}`}>{title}</h3>
          <p className={`text-muted-foreground leading-relaxed ${big ? "text-base max-w-md" : "text-sm"}`}>{desc}</p>
        </div>
      </Tilt>
    </motion.div>
  );
}

/* ─── Stat counter ─── */
function Stat({ value, label, suffix }: { value: number; label: string; suffix?: string }) {
  const { val, ref } = useCounter(value);
  return (
    <motion.div variants={rise} className="flex flex-col items-center gap-2 px-4 sm:px-10">
      <span ref={ref} className="text-4xl sm:text-5xl font-extrabold tabular-nums tracking-tight bg-gradient-to-b from-foreground to-foreground/70 bg-clip-text text-transparent">
        {val.toLocaleString("fr-FR")}
        {suffix && <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary text-3xl sm:text-4xl">{suffix}</span>}
      </span>
      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">{label}</span>
    </motion.div>
  );
}

/* ─── Testimonial ─── */
function Testimonial({ quote, name, role, rating }: { quote: string; name: string; role: string; rating: number }) {
  return (
    <motion.div variants={rise}>
      <Tilt className="glass-coral rounded-2xl p-7 flex flex-col gap-4 h-full hover:glow-coral transition-all duration-500 hover:-translate-y-1.5 cursor-default">
        <div className="flex gap-0.5">
          {Array.from({ length: rating }).map((_, i) => (
            <motion.div key={i} initial={{ opacity: 0, scale: 0 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.08, type: "spring", stiffness: 300 }}>
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
            </motion.div>
          ))}
        </div>
        <p className="text-sm text-foreground/90 leading-relaxed italic">&ldquo;{quote}&rdquo;</p>
        <div className="mt-auto pt-3 border-t border-primary/8">
          <p className="text-sm font-bold text-foreground">{name}</p>
          <p className="text-xs text-muted-foreground">{role}</p>
        </div>
      </Tilt>
    </motion.div>
  );
}

/* ════════════════════════════════════════════
   PAGE
   ════════════════════════════════════════════ */
export default function HomePage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const heroO = useTransform(scrollYProgress, [0, 0.35], [1, 0]);
  const heroS = useTransform(scrollYProgress, [0, 0.35], [1, 0.94]);

  return (
    <div className="relative min-h-screen mesh-coral-bg text-foreground overflow-x-hidden selection:bg-primary/20">

      {/* ─── Grain overlay ─── */}
      <div className="pointer-events-none fixed inset-0 z-[1] opacity-[0.025] mix-blend-multiply"
        aria-hidden="true"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`, backgroundSize: "128px" }} />

      {/* ─── Living blobs (coral atmosphere) ─── */}
      <div className="pointer-events-none fixed inset-0 z-0" aria-hidden="true">
        <Blob className="absolute -top-40 right-[5%] w-[750px] h-[750px] rounded-full bg-gradient-to-br from-primary/14 via-orange-400/6 to-transparent blur-3xl" d={0} />
        <Blob className="absolute top-[55%] -left-40 w-[650px] h-[650px] rounded-full bg-gradient-to-tr from-secondary/10 via-blue-400/4 to-transparent blur-3xl" d={6} />
        <Blob className="absolute top-[25%] left-[45%] w-[500px] h-[500px] rounded-full bg-gradient-to-b from-primary/6 via-pink-400/3 to-transparent blur-3xl" d={12} />
        <Blob className="absolute bottom-[10%] right-[20%] w-[400px] h-[400px] rounded-full bg-gradient-to-tl from-orange-300/8 to-transparent blur-3xl" d={8} />
      </div>

      <div className="relative z-10">

        {/* ═══ NAVBAR ═══ */}
        <motion.header initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5, delay: 0.15 }} className="fixed top-0 z-50 w-full">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-3">
            <nav className="flex h-14 items-center justify-between rounded-2xl glass-surface-dense px-4 sm:px-5 shadow-lg shadow-primary/[0.03]">
              <Link href="/">
                <Image src="/logo-adepa.png" alt="ADEPA Les Extras" width={120} height={40} className="h-9 w-auto object-contain" priority />
              </Link>
              <div className="hidden md:flex items-center gap-7">
                {[{ l: "Fonctionnalités", h: "#fonctionnalites" }, { l: "Indépendants", h: "#independants" }, { l: "Témoignages", h: "#temoignages" }].map(n => (
                  <Link key={n.l} href={n.h} className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors relative group">
                    {n.l}<span className="absolute -bottom-1 left-0 w-0 h-[2px] rounded-full bg-gradient-to-r from-primary to-secondary group-hover:w-full transition-all duration-300" />
                  </Link>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <Button asChild variant="ghost" size="sm" className="text-sm font-semibold hidden sm:inline-flex hover:bg-primary/5"><Link href="/login">Se connecter</Link></Button>
                <Button asChild size="sm" className="rounded-xl px-5 bg-gradient-to-r from-primary via-primary/95 to-primary/85 shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:scale-[1.03] transition-all duration-300">
                  <Link href="/register">Commencer <ArrowRight className="ml-1.5 h-3.5 w-3.5" /></Link>
                </Button>
              </div>
            </nav>
          </div>
        </motion.header>

        <main>
          {/* ═══ HERO ═══ */}
          <section ref={heroRef} className="relative min-h-screen flex items-center pt-24 pb-16 px-6 lg:pt-28">
            <motion.div style={{ y: heroY, opacity: heroO, scale: heroS }} className="mx-auto max-w-7xl w-full">
              <div className="flex flex-col lg:flex-row lg:items-center lg:gap-16">
                <div className="flex-1 max-w-2xl">
                  <motion.div initial={{ opacity: 0, y: 16, scale: 0.92 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.5, type: "spring" }}
                    className="inline-flex items-center gap-2 rounded-full glass-coral px-4 py-1.5 text-xs font-bold text-primary mb-8 shadow-sm glow-coral"
                  >
                    <motion.div animate={{ rotate: [0, 20, -20, 0] }} transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 4 }}><Sparkles className="h-3.5 w-3.5" /></motion.div>
                    Plateforme #1 du médico-social en France
                  </motion.div>

                  <motion.h1 initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.12 }}
                    className="text-[clamp(2.4rem,5vw,4.5rem)] font-extrabold tracking-tight leading-[1.06]"
                  >
                    <span className="text-foreground">Un soignant absent ?</span><br />
                    <span className="relative inline-block mt-1">
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary/90 to-secondary">Remplacé en 47 secondes.</span>
                      <motion.span initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 1.1, duration: 0.6, ease: "easeOut" as const }}
                        className="absolute -bottom-2 left-0 right-0 h-1 rounded-full origin-left bg-gradient-to-r from-primary via-orange-400 to-secondary" />
                    </span>
                  </motion.h1>

                  <motion.p initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}
                    className="mt-7 text-lg text-muted-foreground max-w-lg leading-relaxed"
                  >
                    Publiez votre besoin en <strong className="text-foreground">30 secondes</strong>. Des professionnels vérifiés postulent <strong className="text-foreground">en un clic</strong>. Contrats et facturation <strong className="text-foreground">100% automatiques</strong>.
                  </motion.p>

                  <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.45 }} className="mt-9 flex flex-col sm:flex-row gap-3">
                    <Button asChild size="lg" className="h-14 px-8 text-base font-bold rounded-2xl shadow-xl shadow-primary/25 bg-gradient-to-r from-primary via-primary/95 to-primary/80 hover:shadow-primary/35 hover:scale-[1.03] transition-all duration-300">
                      <Link href="/register?role=CLIENT">Trouver un renfort <ArrowRight className="ml-2 h-4.5 w-4.5" /></Link>
                    </Button>
                    <Button asChild size="lg" variant="outline" className="h-14 px-8 text-base font-semibold rounded-2xl border-primary/20 hover:bg-primary/5 hover:border-primary/30 hover:scale-[1.02] transition-all duration-300">
                      <Link href="/register?role=TALENT">Je suis indépendant</Link>
                    </Button>
                  </motion.div>

                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="mt-8 flex items-center gap-5 text-sm text-muted-foreground">
                    {[{ icon: BadgeCheck, label: "Inscription gratuite", c: "text-emerald-500" }, { icon: ShieldCheck, label: "Profils vérifiés", c: "text-secondary" }, { icon: FileText, label: "Zéro paperasse", c: "text-primary" }].map((t, i) => (
                      <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.9 + i * 0.1 }} className={`flex items-center gap-1.5 ${i === 2 ? "hidden sm:flex" : ""}`}>
                        <t.icon className={`h-4 w-4 ${t.c}`} /><span>{t.label}</span>
                      </motion.div>
                    ))}
                  </motion.div>
                </div>

                <motion.div initial={{ opacity: 0, x: 70, rotate: 4 }} animate={{ opacity: 1, x: 0, rotate: 0 }} transition={{ delay: 0.35, duration: 1, type: "spring", stiffness: 70 }} className="flex-1 mt-16 lg:mt-0 flex justify-center">
                  <MatchingDemo />
                </motion.div>
              </div>
            </motion.div>
          </section>

          {/* ═══ STATS ═══ */}
          <section className="py-14 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-white/60 to-secondary/5 backdrop-blur-sm" />
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-secondary/15 to-transparent" />
            <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-30px" }} className="relative z-10 mx-auto max-w-5xl flex flex-wrap justify-center gap-8 sm:gap-0 sm:divide-x sm:divide-primary/10">
              <Stat value={2847} label="Missions ce mois" />
              <Stat value={47} label="Secondes de match" suffix="s" />
              <Stat value={98} label="Satisfaction" suffix="%" />
              <Stat value={0} label="Frais d'inscription" suffix="€" />
            </motion.div>
          </section>

          {/* ═══ FEATURES ═══ */}
          <section id="fonctionnalites" className="py-28 px-6">
            <div className="mx-auto max-w-7xl">
              <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-center mb-20">
                <Badge variant="quiet" className="mb-5 text-xs bg-primary/10 text-primary border-primary/10 font-bold">Comment ça marche</Badge>
                <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground mb-5 leading-tight">
                  De l&apos;urgence à la solution.
                  <br className="hidden sm:block" />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-orange-500 to-secondary">En quelques minutes.</span>
                </h2>
                <p className="text-lg text-muted-foreground max-w-xl mx-auto">Tout ce dont un directeur a besoin, dans une seule interface.</p>
              </motion.div>
              <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-60px" }} className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <Feature icon={Zap} title="Publication instantanée" desc="Décrivez votre besoin en 30 secondes. Notre algorithme alerte les profils qualifiés dans un rayon de 30 km." v="coral" big />
                <Feature icon={Users} title="Matching intelligent" desc="Diplômes, disponibilités, distance, avis. On filtre — vous choisissez." v="azure" />
                <Feature icon={Clock} title="Confirmation temps réel" desc="Le professionnel postule, vous confirmez. 47 secondes en moyenne." v="coral" />
                <Feature icon={FileText} title="Contrats auto-générés" desc="Contrats, heures et factures générés automatiquement. Conformité totale." v="azure" />
                <Feature icon={ShieldCheck} title="Profils 100% vérifiés" desc="Diplômes, ADELI/RPPS, expérience, avis. Zéro risque." v="coral" />
              </motion.div>
            </div>
          </section>

          {/* ═══ FREELANCE SECTION ═══ */}
          <section id="independants" className="py-28 px-6">
            <div className="mx-auto max-w-7xl">
              <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}
                className="relative rounded-[2.5rem] p-[2px] overflow-hidden"
                style={{ background: "linear-gradient(135deg, hsla(4,78%,58%,0.5), hsla(30,90%,65%,0.3), hsla(220,82%,45%,0.5))" }}
              >
                <div className="relative rounded-[calc(2.5rem-2px)] overflow-hidden" style={{ background: "linear-gradient(160deg, hsla(0,0%,100%,0.95), hsla(12,45%,97%,0.92), hsla(0,0%,100%,0.95))" }}>
                  <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-primary/6 via-orange-400/3 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
                  <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-secondary/5 via-blue-400/3 to-transparent rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />
                  <div className="relative z-10 p-8 sm:p-14 lg:p-20">
                    <div className="flex flex-col lg:flex-row items-start gap-12 lg:gap-20">
                      <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.2 }} className="flex-1 space-y-6 max-w-xl">
                        <Badge variant="info" className="text-xs font-bold">Espace Indépendants</Badge>
                        <h2 className="text-3xl sm:text-4xl lg:text-[2.8rem] font-extrabold tracking-tight text-foreground leading-tight">
                          Votre talent mérite{" "}
                          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-orange-500 to-secondary">mieux qu&apos;un planning vide.</span>
                        </h2>
                        <p className="text-lg text-muted-foreground leading-relaxed">Rejoignez un réseau de soignants indépendants qui choisissent leurs missions et maximisent leurs revenus.</p>
                        <ul className="space-y-3.5 pt-2">
                          {[{ icon: Zap, text: "Fast-Apply : postulez en 1 seconde" }, { icon: FileText, text: "Factures et contrats auto-générés" }, { icon: TrendingUp, text: "Vos ateliers sur la marketplace" }, { icon: DollarSign, text: "Paiement garanti sous 72h" }].map((item, i) => (
                            <motion.li key={i} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 + i * 0.1 }} className="flex items-start gap-3">
                              <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-primary/20 via-primary/10 to-orange-400/5 flex items-center justify-center shrink-0 mt-0.5 ring-1 ring-primary/10">
                                <item.icon className="h-3.5 w-3.5 text-primary" />
                              </div>
                              <span className="text-sm font-medium text-foreground/90">{item.text}</span>
                            </motion.li>
                          ))}
                        </ul>
                        <div className="pt-4">
                          <Button asChild size="lg" className="h-14 px-8 text-base font-bold rounded-2xl shadow-xl shadow-primary/25 bg-gradient-to-r from-primary via-primary/95 to-primary/80 hover:shadow-primary/35 hover:scale-[1.03] transition-all duration-300">
                            <Link href="/register?role=TALENT">Créer mon profil gratuit <ArrowRight className="ml-2 h-4 w-4" /></Link>
                          </Button>
                        </div>
                        <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Commission 0% · 100 premières inscriptions</p>
                      </motion.div>
                      {/* Dashboard mockup */}
                      <motion.div initial={{ opacity: 0, y: 50, rotate: 3 }} whileInView={{ opacity: 1, y: 0, rotate: 1 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.3, type: "spring", stiffness: 80 }} className="flex-1 w-full hidden lg:block" aria-hidden="true">
                        <Tilt className="glass-coral rounded-2xl p-6 shadow-2xl glow-coral cursor-default">
                          <div className="flex items-center justify-between mb-5 pb-4 border-b border-primary/8">
                            <div className="flex items-center gap-2">
                              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary/25 to-orange-400/10 flex items-center justify-center"><TrendingUp className="h-4 w-4 text-primary" /></div>
                              <div><div className="h-2.5 w-20 rounded-full bg-foreground/50" /><div className="h-2 w-14 rounded-full bg-muted-foreground/25 mt-1.5" /></div>
                            </div>
                            <Badge variant="success" className="text-[9px]">En ligne</Badge>
                          </div>
                          <div className="grid grid-cols-3 gap-2.5 mb-5">
                            {[{ l: "CA mois", v: "2 840€", c: "text-emerald-600" }, { l: "Missions", v: "12", c: "text-foreground" }, { l: "Note", v: "4.9★", c: "text-amber-600" }].map((k, i) => (
                              <motion.div key={i} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.5 + i * 0.1 }}
                                className="rounded-xl bg-white/60 border border-primary/8 p-3"><p className="text-[9px] text-muted-foreground mb-0.5">{k.l}</p><p className={`text-sm font-bold ${k.c}`}>{k.v}</p></motion.div>
                            ))}
                          </div>
                          {[{ t: "IDE", p: "EHPAD Les Oliviers", pay: "320€", u: true }, { t: "AS", p: "Clinique Saint-Joseph", pay: "245€", u: false }].map((m, i) => (
                            <motion.div key={i} initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.7 + i * 0.15 }}
                              className="rounded-xl bg-white/60 border border-primary/8 p-3.5 mb-2.5 flex items-center gap-3">
                              <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${m.u ? "bg-gradient-to-br from-primary/20 to-orange-400/5" : "bg-muted/50"}`}><CalendarDays className={`h-4 w-4 ${m.u ? "text-primary" : "text-muted-foreground"}`} /></div>
                              <div className="flex-1 min-w-0"><div className="flex items-center gap-1.5"><p className="text-xs font-bold text-foreground">{m.t}</p>{m.u && <span className="text-[8px] font-bold bg-gradient-to-r from-red-500 to-primary text-white px-1.5 py-0.5 rounded-full">SOS</span>}</div><p className="text-[10px] text-muted-foreground truncate">{m.p}</p></div>
                              <span className="text-xs font-bold text-emerald-600 shrink-0">{m.pay}</span>
                            </motion.div>
                          ))}
                        </Tilt>
                      </motion.div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </section>

          {/* ═══ TESTIMONIALS ═══ */}
          <section id="temoignages" className="py-28 px-6">
            <div className="mx-auto max-w-7xl">
              <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
                <Badge variant="quiet" className="mb-5 text-xs bg-secondary/8 text-secondary border-secondary/10 font-bold">Ce qu&apos;ils en disent</Badge>
                <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground mb-5 leading-tight">
                  Adopté par des centaines{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary via-blue-400 to-primary">d&apos;établissements.</span>
                </h2>
              </motion.div>
              <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-60px" }} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Testimonial quote="On est passé de 4h de téléphone à 47 secondes. Les Extras a sauvé nos week-ends." name="Dr. Marie-Claire Dubois" role="Directrice · EHPAD La Résidence du Parc" rating={5} />
                <Testimonial quote="Interface d'une clarté absolue. Mes cadres n'ont eu besoin d'aucune formation. Publier, cliquer, terminé." name="Thomas Bergeron" role="DRH · Groupe Santé Horizon" rating={5} />
                <Testimonial quote="En 3 mois j'ai doublé mes revenus. Le Fast-Apply me laisse me concentrer sur mes patients." name="Sophie Martin" role="Infirmière IDE · Freelance" rating={5} />
              </motion.div>
            </div>
          </section>

          {/* ═══ CTA ═══ */}
          <section className="py-24 px-6">
            <div className="mx-auto max-w-4xl text-center">
              <motion.div initial={{ opacity: 0, y: 40, scale: 0.95 }} whileInView={{ opacity: 1, y: 0, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.7, type: "spring" }}
                className="relative rounded-3xl overflow-hidden glass-coral glow-coral"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-transparent to-secondary/8" />
                <motion.div animate={{ x: ["-100%", "200%"] }} transition={{ duration: 3, repeat: Infinity, repeatDelay: 3, ease: "easeInOut" as const }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12" />
                <div className="relative z-10 p-10 sm:p-16">
                  <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground mb-4">
                    Prêt à ne plus jamais{" "}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-orange-500 to-secondary">manquer de personnel ?</span>
                  </h2>
                  <p className="text-lg text-muted-foreground max-w-lg mx-auto mb-8">Rejoignez les établissements qui ont automatisé leur recrutement.</p>
                  <div className="flex flex-col sm:flex-row justify-center gap-3">
                    <Button asChild size="lg" className="h-14 px-8 text-lg font-bold rounded-2xl shadow-xl shadow-primary/25 bg-gradient-to-r from-primary via-primary/95 to-primary/80 hover:shadow-primary/35 hover:scale-[1.04] transition-all duration-300">
                      <Link href="/register?role=CLIENT">Commencer gratuitement <ArrowRight className="ml-2 h-5 w-5" /></Link>
                    </Button>
                    <Button asChild size="lg" variant="outline" className="h-14 px-8 text-lg font-semibold rounded-2xl border-secondary/20 text-secondary hover:bg-secondary/5 hover:scale-[1.03] transition-all duration-300">
                      <Link href="/register?role=TALENT">Espace indépendant <ArrowUpRight className="ml-2 h-4 w-4" /></Link>
                    </Button>
                  </div>
                  <p className="mt-6 text-xs text-muted-foreground font-medium">Pas de carte · 2 min · Support prioritaire</p>
                </div>
              </motion.div>
            </div>
          </section>
        </main>

        {/* ═══ FOOTER ═══ */}
        <footer className="border-t border-primary/8 py-12 px-6 bg-gradient-to-b from-transparent via-primary/[0.02] to-primary/[0.04]">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-col md:flex-row justify-between items-start gap-10 mb-10">
              <div className="max-w-xs">
                <Link href="/" className="block mb-4"><Image src="/logo-adepa.png" alt="ADEPA Les Extras" width={100} height={34} className="h-8 w-auto object-contain" /></Link>
                <p className="text-sm text-muted-foreground leading-relaxed">Mise en relation premium pour le médico-social en temps réel.</p>
              </div>
              <div className="flex gap-16">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">Plateforme</p>
                  <ul className="space-y-2"><li><Link href="/login" className="text-sm text-muted-foreground hover:text-primary transition-colors">Se connecter</Link></li><li><Link href="/register" className="text-sm text-muted-foreground hover:text-primary transition-colors">Inscription</Link></li></ul>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">Légal</p>
                  <ul className="space-y-2"><li><Link href="/privacy" className="text-sm text-muted-foreground hover:text-primary transition-colors">Confidentialité</Link></li><li><Link href="/terms" className="text-sm text-muted-foreground hover:text-primary transition-colors">CGU</Link></li></ul>
                </div>
              </div>
            </div>
            <div className="pt-8 border-t border-primary/8 flex flex-col sm:flex-row justify-between items-center gap-4">
              <p className="text-xs text-muted-foreground">© 2026 ADEPA — Les Extras</p>
              <p className="text-xs text-muted-foreground flex items-center gap-1">Fait avec <Heart className="h-3 w-3 fill-primary/60 text-primary/60" /> pour le médico-social</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

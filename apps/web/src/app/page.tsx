"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, useScroll, useTransform, useMotionValue, useSpring, useInView } from "framer-motion";
import { useRef, useState, useEffect, useCallback } from "react";
import {
  ArrowRight, CheckCircle, ShieldCheck, Clock, Star, Zap, MapPin,
  TrendingUp, Users, Sparkles, BadgeCheck, ArrowUpRight, CalendarDays,
  FileText, DollarSign, ChevronRight, Heart, Activity,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

/* ─── Constants ─── */
const DISPLAY = "font-[family-name:var(--font-display)]";

/* ─── Animation presets ─── */
const stagger = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.10, delayChildren: 0.15 } } };
const rise = { hidden: { opacity: 0, y: 40 }, show: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] as const } } };
const slideLeft = { hidden: { opacity: 0, x: -30 }, show: { opacity: 1, x: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const } } };

/* ─── Animated counter ─── */
function useCounter(target: number, dur = 1200) {
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
  const rx = useSpring(useTransform(my, [-0.5, 0.5], [4, -4]), { stiffness: 260, damping: 28 });
  const ry = useSpring(useTransform(mx, [-0.5, 0.5], [-4, 4]), { stiffness: 260, damping: 28 });
  const move = useCallback((e: React.MouseEvent) => {
    if (!el.current) return;
    const r = el.current.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  }, [mx, my]);
  const leave = useCallback(() => { mx.set(0); my.set(0); }, [mx, my]);
  return (
    <motion.div ref={el} style={{ rotateX: rx, rotateY: ry, transformPerspective: 900 }} onMouseMove={move} onMouseLeave={leave} className={className}>
      {children}
    </motion.div>
  );
}

/* ─── Floating Blob ─── */
function Blob({ className, d = 0 }: { className: string; d?: number }) {
  return (
    <motion.div className={className}
      animate={{ x: [0, 25, -18, 0], y: [0, -20, 12, 0], scale: [1, 1.04, 0.97, 1] }}
      transition={{ duration: 20, delay: d, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}

/* ─── Hero Matching Demo ─── */
function MatchingDemo() {
  return (
    <div className="relative w-full max-w-[420px] mx-auto" aria-hidden="true">
      <div className="absolute -inset-16 rounded-[4rem] opacity-50" style={{
        background: "radial-gradient(ellipse at 30% 30%, hsla(4,78%,58%,0.12), transparent 60%), radial-gradient(ellipse at 70% 70%, hsla(218,72%,50%,0.08), transparent 60%)"
      }} />

      {/* Card 1 — Urgent */}
      <motion.div initial={{ opacity: 0, y: 50, rotate: -3 }} animate={{ opacity: 1, y: 0, rotate: -1.5 }} transition={{ delay: 0.5, duration: 0.8, type: "spring", stiffness: 90 }}>
        <Tilt className="relative rounded-2xl p-5 glass-coral glow-coral-soft cursor-default">
          <motion.div animate={{ boxShadow: ["0 0 0 0 hsla(4,78%,58%,0)", "0 0 0 8px hsla(4,78%,58%,0.10)", "0 0 0 0 hsla(4,78%,58%,0)"] }}
            transition={{ duration: 2.2, repeat: Infinity, delay: 1.2 }}
            className="absolute -top-1.5 -right-1.5 h-3 w-3 rounded-full bg-gradient-to-br from-[hsl(var(--primary))] to-red-500"
          />
          <div className="flex items-start gap-3.5">
            <motion.div animate={{ rotate: [0, -8, 8, 0] }} transition={{ duration: 0.5, delay: 0.8 }}
              className="h-11 w-11 rounded-xl bg-gradient-to-br from-[hsl(var(--primary)/0.20)] to-orange-300/10 flex items-center justify-center shrink-0 ring-1 ring-[hsl(var(--primary)/0.15)]"
            >
              <Zap className="h-5 w-5 text-[hsl(var(--primary))]" />
            </motion.div>
            <div className="min-w-0 space-y-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-bold text-foreground">Besoin urgent publié</p>
                <span className="inline-flex items-center gap-1 text-[9px] font-bold bg-gradient-to-r from-red-500 to-[hsl(var(--primary))] text-white px-2 py-0.5 rounded-full animate-pulse">URGENT</span>
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
      <motion.div initial={{ opacity: 0, y: 35, x: 25, scale: 0.92 }} animate={{ opacity: 1, y: 0, x: 0, scale: 1 }} transition={{ delay: 1.5, duration: 0.6, type: "spring", stiffness: 120 }} className="mt-3 ml-8">
        <Tilt className="relative rounded-2xl p-4 glass-azure glow-azure-soft cursor-default">
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2.5">
              {[0, 1, 2].map(i => (
                <motion.div key={i} initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.7 + i * 0.12, type: "spring", stiffness: 200 }}
                  className={`h-9 w-9 rounded-full border-2 border-white/80 flex items-center justify-center shadow-sm ${i === 0 ? "bg-gradient-to-br from-[hsl(var(--secondary)/0.20)] to-[hsl(var(--secondary)/0.08)]" : i === 1 ? "bg-gradient-to-br from-[hsl(var(--primary)/0.20)] to-[hsl(var(--primary)/0.08)]" : "bg-gradient-to-br from-emerald-400/20 to-emerald-400/8"}`}>
                  <Users className="h-3.5 w-3.5 text-muted-foreground" />
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
      <motion.div initial={{ opacity: 0, scale: 0.4, y: 15 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ delay: 2.4, type: "spring", stiffness: 250, damping: 14 }}
        className="mt-3 ml-14 inline-flex items-center gap-2.5 rounded-full px-5 py-2.5 shadow-md"
        style={{ background: "linear-gradient(135deg, hsla(150,60%,45%,0.10), hsla(150,60%,45%,0.04))", border: "1px solid hsla(150,60%,45%,0.18)" }}>
        <motion.div animate={{ rotate: [0, 360] }} transition={{ delay: 2.6, duration: 0.5 }}>
          <CheckCircle className="h-4.5 w-4.5 text-emerald-500" />
        </motion.div>
        <span className="text-sm font-bold text-emerald-700">Mission confirmée</span>
        <span className="text-[10px] text-emerald-600 font-semibold">47s</span>
      </motion.div>
    </div>
  );
}

/* ─── Feature Bento Card ─── */
function Feature({ icon: Icon, title, desc, accent = "coral", span }: {
  icon: React.ComponentType<{ className?: string }>; title: string; desc: string; accent?: "coral" | "azure"; span?: string;
}) {
  const isCoral = accent === "coral";
  return (
    <motion.div variants={rise} className={span}>
      <Tilt className={`group relative overflow-hidden rounded-3xl p-7 sm:p-8 h-full transition-all duration-500 hover:-translate-y-1.5 hover:shadow-xl cursor-default ${isCoral ? "glass-coral hover:glow-coral-soft" : "glass-azure hover:glow-azure-soft"}`}>
        <div className={`absolute -top-10 -right-10 h-44 w-44 rounded-full blur-3xl opacity-0 group-hover:opacity-20 transition-all duration-700 ${isCoral ? "bg-[hsl(var(--primary))]" : "bg-[hsl(var(--secondary))]"}`} />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="relative z-10 flex flex-col h-full">
          <motion.div whileHover={{ rotate: [0, -10, 10, -5, 0], scale: 1.12 }} transition={{ duration: 0.45 }}
            className={`h-12 w-12 rounded-2xl flex items-center justify-center mb-5 ${isCoral ? "bg-gradient-to-br from-[hsl(var(--primary)/0.18)] to-orange-300/5 ring-1 ring-[hsl(var(--primary)/0.12)]" : "bg-gradient-to-br from-[hsl(var(--secondary)/0.18)] to-blue-300/5 ring-1 ring-[hsl(var(--secondary)/0.12)]"}`}>
            <Icon className={`h-6 w-6 ${isCoral ? "text-[hsl(var(--primary))]" : "text-[hsl(var(--secondary))]"}`} />
          </motion.div>
          <h3 className={`${DISPLAY} font-bold text-foreground mb-2 text-lg`}>{title}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
        </div>
      </Tilt>
    </motion.div>
  );
}

/* ─── Stat counter ─── */
function Stat({ value, label, suffix }: { value: number; label: string; suffix?: string }) {
  const { val, ref } = useCounter(value);
  return (
    <motion.div variants={rise} className="flex flex-col items-center gap-1.5 px-4 sm:px-10">
      <span ref={ref} className={`${DISPLAY} text-4xl sm:text-5xl font-extrabold tabular-nums tracking-tight bg-gradient-to-b from-foreground to-foreground/65 bg-clip-text text-transparent`}>
        {val.toLocaleString("fr-FR")}
        {suffix && <span className="text-transparent bg-clip-text bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--secondary))] text-3xl sm:text-4xl">{suffix}</span>}
      </span>
      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.18em]">{label}</span>
    </motion.div>
  );
}

/* ─── Testimonial ─── */
function Testimonial({ quote, name, role, rating }: { quote: string; name: string; role: string; rating: number }) {
  return (
    <motion.div variants={rise}>
      <Tilt className="glass-warm rounded-2xl p-7 flex flex-col gap-4 h-full hover:glow-coral-soft transition-all duration-500 hover:-translate-y-1 cursor-default">
        <div className="flex gap-0.5">
          {Array.from({ length: rating }).map((_, i) => (
            <motion.div key={i} initial={{ opacity: 0, scale: 0 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.07, type: "spring", stiffness: 300 }}>
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
            </motion.div>
          ))}
        </div>
        <p className="text-sm text-foreground/85 leading-relaxed italic">&ldquo;{quote}&rdquo;</p>
        <div className="mt-auto pt-3 border-t border-[hsl(var(--border))]">
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
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 180]);
  const heroO = useTransform(scrollYProgress, [0, 0.35], [1, 0]);
  const heroS = useTransform(scrollYProgress, [0, 0.35], [1, 0.95]);

  return (
    <div className="relative min-h-screen aurora-mesh text-foreground overflow-x-hidden selection:bg-[hsl(var(--primary)/0.15)]">

      {/* ─── Grain overlay ─── */}
      <div className="pointer-events-none fixed inset-0 z-[1] opacity-[0.018] mix-blend-multiply" aria-hidden="true"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`, backgroundSize: "128px" }} />

      {/* ─── Living blobs ─── */}
      <div className="pointer-events-none fixed inset-0 z-0" aria-hidden="true">
        <Blob className="absolute -top-32 right-[8%] w-[680px] h-[680px] rounded-full bg-gradient-to-br from-[hsl(var(--primary)/0.10)] via-orange-300/5 to-transparent blur-3xl" d={0} />
        <Blob className="absolute top-[50%] -left-32 w-[580px] h-[580px] rounded-full bg-gradient-to-tr from-[hsl(var(--secondary)/0.07)] via-blue-300/3 to-transparent blur-3xl" d={5} />
        <Blob className="absolute top-[22%] left-[42%] w-[450px] h-[450px] rounded-full bg-gradient-to-b from-[hsl(var(--primary)/0.05)] via-rose-300/3 to-transparent blur-3xl" d={10} />
        <Blob className="absolute bottom-[12%] right-[18%] w-[360px] h-[360px] rounded-full bg-gradient-to-tl from-orange-200/8 to-transparent blur-3xl" d={7} />
      </div>

      <div className="relative z-10">

        {/* ═══ NAVBAR ═══ */}
        <motion.header initial={{ y: -16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.45, delay: 0.1 }} className="fixed top-0 z-50 w-full">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-3">
            <nav className="flex h-14 items-center justify-between rounded-2xl glass-warm-dense px-4 sm:px-5 shadow-lg shadow-[hsl(var(--primary)/0.03)]">
              <Link href="/">
                <Image src="/logo-adepa.png" alt="ADEPA Les Extras" width={120} height={40} className="h-9 w-auto object-contain" priority />
              </Link>
              <div className="hidden md:flex items-center gap-7">
                {[{ l: "Fonctionnalités", h: "#fonctionnalites" }, { l: "Indépendants", h: "#independants" }, { l: "Témoignages", h: "#temoignages" }].map(n => (
                  <Link key={n.l} href={n.h} className="text-sm font-medium text-muted-foreground hover:text-[hsl(var(--primary))] transition-colors relative group">
                    {n.l}<span className="absolute -bottom-1 left-0 w-0 h-[2px] rounded-full bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--secondary))] group-hover:w-full transition-all duration-300" />
                  </Link>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <Button asChild variant="ghost" size="sm" className="text-sm font-semibold hidden sm:inline-flex hover:bg-[hsl(var(--primary)/0.05)]"><Link href="/login">Se connecter</Link></Button>
                <Button asChild size="sm" className="rounded-xl px-5 bg-gradient-to-r from-[hsl(var(--primary))] via-[hsl(var(--coral-400))] to-[hsl(var(--primary))] shadow-lg shadow-[hsl(var(--primary)/0.18)] hover:shadow-[hsl(var(--primary)/0.28)] hover:scale-[1.03] transition-all duration-300">
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
                  <motion.div initial={{ opacity: 0, y: 14, scale: 0.93 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.45, type: "spring" }}
                    className="inline-flex items-center gap-2 rounded-full glass-coral px-4 py-1.5 text-xs font-bold text-[hsl(var(--primary))] mb-7 shadow-sm">
                    <motion.div animate={{ rotate: [0, 15, -15, 0] }} transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 4 }}><Sparkles className="h-3.5 w-3.5" /></motion.div>
                    Plateforme #1 du médico-social en France
                  </motion.div>

                  <motion.h1 initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }}
                    className={`${DISPLAY} text-[clamp(2.2rem,5vw,4.2rem)] font-extrabold tracking-tight leading-[1.08]`}>
                    <span className="text-foreground">Un soignant absent ?</span><br />
                    <span className="relative inline-block mt-1">
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-[hsl(var(--primary))] via-[hsl(var(--coral-400))] to-[hsl(var(--secondary))]">Remplacé en 47 secondes.</span>
                      <motion.span initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 1, duration: 0.55, ease: "easeOut" }}
                        className="absolute -bottom-1.5 left-0 right-0 h-[3px] rounded-full origin-left bg-gradient-to-r from-[hsl(var(--primary))] via-[hsl(var(--coral-400))] to-[hsl(var(--secondary))]" />
                    </span>
                  </motion.h1>

                  <motion.p initial={{ opacity: 0, y: 25 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.25 }}
                    className="mt-6 text-lg text-muted-foreground max-w-lg leading-relaxed">
                    Publiez votre besoin en <strong className="text-foreground">30 secondes</strong>. Des professionnels vérifiés postulent <strong className="text-foreground">en un clic</strong>. Contrats et facturation <strong className="text-foreground">100% automatiques</strong>.
                  </motion.p>

                  <motion.div initial={{ opacity: 0, y: 25 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.4 }} className="mt-8 flex flex-col sm:flex-row gap-3">
                    <Button asChild size="lg" className="h-13 px-7 text-base font-bold rounded-2xl shadow-xl shadow-[hsl(var(--primary)/0.20)] bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--coral-400))] hover:shadow-[hsl(var(--primary)/0.30)] hover:scale-[1.03] transition-all duration-300">
                      <Link href="/register?role=CLIENT">Trouver un renfort <ArrowRight className="ml-2 h-4 w-4" /></Link>
                    </Button>
                    <Button asChild size="lg" variant="outline" className="h-13 px-7 text-base font-semibold rounded-2xl border-[hsl(var(--primary)/0.18)] hover:bg-[hsl(var(--primary)/0.04)] hover:border-[hsl(var(--primary)/0.28)] hover:scale-[1.02] transition-all duration-300">
                      <Link href="/register?role=TALENT">Je suis indépendant</Link>
                    </Button>
                  </motion.div>

                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }} className="mt-7 flex items-center gap-5 text-sm text-muted-foreground">
                    {[{ icon: BadgeCheck, label: "Inscription gratuite", c: "text-emerald-500" }, { icon: ShieldCheck, label: "Profils vérifiés", c: "text-[hsl(var(--secondary))]" }, { icon: FileText, label: "Zéro paperasse", c: "text-[hsl(var(--primary))]" }].map((t, i) => (
                      <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.8 + i * 0.1 }} className={`flex items-center gap-1.5 ${i === 2 ? "hidden sm:flex" : ""}`}>
                        <t.icon className={`h-4 w-4 ${t.c}`} /><span>{t.label}</span>
                      </motion.div>
                    ))}
                  </motion.div>
                </div>

                <motion.div initial={{ opacity: 0, x: 60, rotate: 3 }} animate={{ opacity: 1, x: 0, rotate: 0 }} transition={{ delay: 0.3, duration: 0.9, type: "spring", stiffness: 70 }} className="flex-1 mt-14 lg:mt-0 flex justify-center">
                  <MatchingDemo />
                </motion.div>
              </div>
            </motion.div>
          </section>

          {/* ═══ STATS ═══ */}
          <section className="py-12 relative overflow-hidden">
            <div className="absolute inset-0 glass-warm-dense" />
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[hsl(var(--primary)/0.15)] to-transparent" />
            <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[hsl(var(--secondary)/0.10)] to-transparent" />
            <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-30px" }}
              className="relative z-10 mx-auto max-w-5xl flex flex-wrap justify-center gap-8 sm:gap-0 sm:divide-x sm:divide-[hsl(var(--border))]">
              <Stat value={2847} label="Missions ce mois" />
              <Stat value={47} label="Secondes de match" suffix="s" />
              <Stat value={98} label="Satisfaction" suffix="%" />
              <Stat value={0} label="Frais d'inscription" suffix="€" />
            </motion.div>
          </section>

          {/* ═══ FEATURES BENTO ═══ */}
          <section id="fonctionnalites" className="py-24 px-6">
            <div className="mx-auto max-w-7xl">
              <motion.div initial={{ opacity: 0, y: 25 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.55 }} className="text-center mb-16">
                <Badge variant="quiet" className="mb-4 text-xs bg-[hsl(var(--primary)/0.08)] text-[hsl(var(--primary))] border-[hsl(var(--primary)/0.08)] font-bold">Comment ça marche</Badge>
                <h2 className={`${DISPLAY} text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground mb-4 leading-tight`}>
                  De l&apos;urgence à la solution.<br className="hidden sm:block" />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[hsl(var(--primary))] via-[hsl(var(--coral-400))] to-[hsl(var(--secondary))]">En quelques minutes.</span>
                </h2>
                <p className="text-lg text-muted-foreground max-w-xl mx-auto">Tout ce dont un directeur a besoin, dans une seule interface.</p>
              </motion.div>
              <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }} className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <Feature icon={Zap} title="Publication instantanée" desc="Décrivez votre besoin en 30 secondes. Notre algorithme alerte les profils qualifiés dans un rayon de 30 km." accent="coral" span="md:col-span-2 md:row-span-2" />
                <Feature icon={Users} title="Matching intelligent" desc="Diplômes, disponibilités, distance, avis. On filtre — vous choisissez." accent="azure" />
                <Feature icon={Clock} title="Confirmation temps réel" desc="Le professionnel postule, vous confirmez. 47 secondes en moyenne." accent="coral" />
                <Feature icon={FileText} title="Contrats auto-générés" desc="Contrats, heures et factures générés automatiquement. Conformité totale." accent="azure" />
                <Feature icon={ShieldCheck} title="Profils 100% vérifiés" desc="Diplômes, ADELI/RPPS, expérience, avis. Zéro risque." accent="coral" />
              </motion.div>
            </div>
          </section>

          {/* ═══ FREELANCE SECTION ═══ */}
          <section id="independants" className="py-24 px-6">
            <div className="mx-auto max-w-7xl">
              <motion.div initial={{ opacity: 0, y: 35 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}
                className="relative rounded-[2.5rem] p-[2px] overflow-hidden"
                style={{ background: "linear-gradient(135deg, hsla(4,78%,58%,0.35), hsla(24,90%,68%,0.25), hsla(218,72%,50%,0.30))" }}>
                <div className="relative rounded-[calc(2.5rem-2px)] overflow-hidden" style={{ background: "linear-gradient(160deg, hsla(30,40%,98%,0.97), hsla(14,60%,96%,0.95), hsla(30,40%,98%,0.97))" }}>
                  <div className="absolute top-0 right-0 w-[450px] h-[450px] bg-gradient-to-br from-[hsl(var(--primary)/0.05)] via-orange-300/3 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
                  <div className="absolute bottom-0 left-0 w-[350px] h-[350px] bg-gradient-to-tr from-[hsl(var(--secondary)/0.04)] via-blue-300/2 to-transparent rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />
                  <div className="relative z-10 p-8 sm:p-12 lg:p-16">
                    <div className="flex flex-col lg:flex-row items-start gap-10 lg:gap-16">
                      <motion.div initial={{ opacity: 0, x: -25 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.15 }} className="flex-1 space-y-5 max-w-xl">
                        <Badge variant="info" className="text-xs font-bold">Espace Indépendants</Badge>
                        <h2 className={`${DISPLAY} text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground leading-tight`}>
                          Votre talent mérite{" "}
                          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[hsl(var(--primary))] via-[hsl(var(--coral-400))] to-[hsl(var(--secondary))]">mieux qu&apos;un planning vide.</span>
                        </h2>
                        <p className="text-lg text-muted-foreground leading-relaxed">Rejoignez un réseau de soignants indépendants qui choisissent leurs missions et maximisent leurs revenus.</p>
                        <ul className="space-y-3 pt-1">
                          {[{ icon: Zap, text: "Fast-Apply : postulez en 1 seconde" }, { icon: FileText, text: "Factures et contrats auto-générés" }, { icon: TrendingUp, text: "Vos ateliers sur la marketplace" }, { icon: DollarSign, text: "Paiement garanti sous 72h" }].map((item, i) => (
                            <motion.li key={i} initial={{ opacity: 0, x: -16 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.25 + i * 0.08 }} className="flex items-start gap-3">
                              <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-[hsl(var(--primary)/0.15)] to-orange-300/5 flex items-center justify-center shrink-0 mt-0.5 ring-1 ring-[hsl(var(--primary)/0.10)]">
                                <item.icon className="h-3.5 w-3.5 text-[hsl(var(--primary))]" />
                              </div>
                              <span className="text-sm font-medium text-foreground/85">{item.text}</span>
                            </motion.li>
                          ))}
                        </ul>
                        <div className="pt-3">
                          <Button asChild size="lg" className="h-13 px-7 text-base font-bold rounded-2xl shadow-xl shadow-[hsl(var(--primary)/0.20)] bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--coral-400))] hover:shadow-[hsl(var(--primary)/0.30)] hover:scale-[1.03] transition-all duration-300">
                            <Link href="/register?role=TALENT">Créer mon profil gratuit <ArrowRight className="ml-2 h-4 w-4" /></Link>
                          </Button>
                        </div>
                        <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Commission 0% · 100 premières inscriptions</p>
                      </motion.div>

                      {/* Dashboard mockup */}
                      <motion.div initial={{ opacity: 0, y: 40, rotate: 2 }} whileInView={{ opacity: 1, y: 0, rotate: 0.5 }} viewport={{ once: true }} transition={{ duration: 0.7, delay: 0.25, type: "spring", stiffness: 80 }} className="flex-1 w-full hidden lg:block" aria-hidden="true">
                        <Tilt className="glass-warm rounded-2xl p-6 shadow-xl glow-coral-soft cursor-default">
                          <div className="flex items-center justify-between mb-5 pb-4 border-b border-[hsl(var(--border))]">
                            <div className="flex items-center gap-2">
                              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-[hsl(var(--primary)/0.18)] to-orange-300/8 flex items-center justify-center"><TrendingUp className="h-4 w-4 text-[hsl(var(--primary))]" /></div>
                              <div><div className="h-2.5 w-20 rounded-full bg-foreground/40" /><div className="h-2 w-14 rounded-full bg-muted-foreground/20 mt-1.5" /></div>
                            </div>
                            <Badge variant="success" className="text-[9px]">En ligne</Badge>
                          </div>
                          <div className="grid grid-cols-3 gap-2.5 mb-5">
                            {[{ l: "CA mois", v: "2 840€", c: "text-emerald-600" }, { l: "Missions", v: "12", c: "text-foreground" }, { l: "Note", v: "4.9★", c: "text-amber-600" }].map((k, i) => (
                              <motion.div key={i} initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.4 + i * 0.08 }}
                                className="rounded-xl bg-white/50 border border-[hsl(var(--border))] p-3"><p className="text-[9px] text-muted-foreground mb-0.5">{k.l}</p><p className={`text-sm font-bold ${k.c}`}>{k.v}</p></motion.div>
                            ))}
                          </div>
                          {[{ t: "IDE", p: "EHPAD Les Oliviers", pay: "320€", u: true }, { t: "AS", p: "Clinique Saint-Joseph", pay: "245€", u: false }].map((m, i) => (
                            <motion.div key={i} initial={{ opacity: 0, x: 15 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.6 + i * 0.12 }}
                              className="rounded-xl bg-white/50 border border-[hsl(var(--border))] p-3.5 mb-2.5 flex items-center gap-3">
                              <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${m.u ? "bg-gradient-to-br from-[hsl(var(--primary)/0.15)] to-orange-300/5" : "bg-muted/40"}`}><CalendarDays className={`h-4 w-4 ${m.u ? "text-[hsl(var(--primary))]" : "text-muted-foreground"}`} /></div>
                              <div className="flex-1 min-w-0"><div className="flex items-center gap-1.5"><p className="text-xs font-bold text-foreground">{m.t}</p>{m.u && <span className="text-[8px] font-bold bg-gradient-to-r from-red-500 to-[hsl(var(--primary))] text-white px-1.5 py-0.5 rounded-full">URGENT</span>}</div><p className="text-[10px] text-muted-foreground truncate">{m.p}</p></div>
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
          <section id="temoignages" className="py-24 px-6">
            <div className="mx-auto max-w-7xl">
              <motion.div initial={{ opacity: 0, y: 25 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
                <Badge variant="quiet" className="mb-4 text-xs bg-[hsl(var(--secondary)/0.07)] text-[hsl(var(--secondary))] border-[hsl(var(--secondary)/0.08)] font-bold">Ce qu&apos;ils en disent</Badge>
                <h2 className={`${DISPLAY} text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground mb-4 leading-tight`}>
                  Adopté par des centaines{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[hsl(var(--secondary))] via-blue-400 to-[hsl(var(--primary))]">d&apos;établissements.</span>
                </h2>
              </motion.div>
              <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Testimonial quote="On est passé de 4h de téléphone à 47 secondes. Les Extras a sauvé nos week-ends." name="Dr. Marie-Claire Dubois" role="Directrice · EHPAD La Résidence du Parc" rating={5} />
                <Testimonial quote="Interface d'une clarté absolue. Mes cadres n'ont eu besoin d'aucune formation. Publier, cliquer, terminé." name="Thomas Bergeron" role="DRH · Groupe Santé Horizon" rating={5} />
                <Testimonial quote="En 3 mois j'ai doublé mes revenus. Le Fast-Apply me laisse me concentrer sur mes patients." name="Sophie Martin" role="Infirmière IDE · Freelance" rating={5} />
              </motion.div>
            </div>
          </section>

          {/* ═══ CTA ═══ */}
          <section className="py-20 px-6">
            <div className="mx-auto max-w-4xl text-center">
              <motion.div initial={{ opacity: 0, y: 35, scale: 0.96 }} whileInView={{ opacity: 1, y: 0, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.6, type: "spring" }}
                className="relative rounded-3xl overflow-hidden glass-coral glow-coral-soft">
                <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--primary)/0.06)] via-transparent to-[hsl(var(--secondary)/0.05)]" />
                <motion.div animate={{ x: ["-100%", "200%"] }} transition={{ duration: 3.5, repeat: Infinity, repeatDelay: 4, ease: "easeInOut" }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent skew-x-12" />
                <div className="relative z-10 p-10 sm:p-14">
                  <h2 className={`${DISPLAY} text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground mb-4`}>
                    Prêt à ne plus jamais{" "}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-[hsl(var(--primary))] via-[hsl(var(--coral-400))] to-[hsl(var(--secondary))]">manquer de personnel ?</span>
                  </h2>
                  <p className="text-lg text-muted-foreground max-w-lg mx-auto mb-8">Rejoignez les établissements qui ont automatisé leur recrutement.</p>
                  <div className="flex flex-col sm:flex-row justify-center gap-3">
                    <Button asChild size="lg" className="h-13 px-8 text-lg font-bold rounded-2xl shadow-xl shadow-[hsl(var(--primary)/0.20)] bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--coral-400))] hover:shadow-[hsl(var(--primary)/0.30)] hover:scale-[1.03] transition-all duration-300">
                      <Link href="/register?role=CLIENT">Commencer gratuitement <ArrowRight className="ml-2 h-5 w-5" /></Link>
                    </Button>
                    <Button asChild size="lg" variant="outline" className="h-13 px-8 text-lg font-semibold rounded-2xl border-[hsl(var(--secondary)/0.18)] text-[hsl(var(--secondary))] hover:bg-[hsl(var(--secondary)/0.04)] hover:scale-[1.02] transition-all duration-300">
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
        <footer className="border-t border-[hsl(var(--border))] py-10 px-6 bg-gradient-to-b from-transparent to-[hsl(var(--primary)/0.02)]">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-col md:flex-row justify-between items-start gap-10 mb-8">
              <div className="max-w-xs">
                <Link href="/" className="block mb-4"><Image src="/logo-adepa.png" alt="ADEPA Les Extras" width={100} height={34} className="h-8 w-auto object-contain" /></Link>
                <p className="text-sm text-muted-foreground leading-relaxed">Mise en relation premium pour le médico-social en temps réel.</p>
              </div>
              <div className="flex gap-14">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">Plateforme</p>
                  <ul className="space-y-2"><li><Link href="/login" className="text-sm text-muted-foreground hover:text-[hsl(var(--primary))] transition-colors">Se connecter</Link></li><li><Link href="/register" className="text-sm text-muted-foreground hover:text-[hsl(var(--primary))] transition-colors">Inscription</Link></li></ul>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">Légal</p>
                  <ul className="space-y-2"><li><Link href="/privacy" className="text-sm text-muted-foreground hover:text-[hsl(var(--primary))] transition-colors">Confidentialité</Link></li><li><Link href="/terms" className="text-sm text-muted-foreground hover:text-[hsl(var(--primary))] transition-colors">CGU</Link></li></ul>
                </div>
              </div>
            </div>
            <div className="pt-6 border-t border-[hsl(var(--border))] flex flex-col sm:flex-row justify-between items-center gap-3">
              <p className="text-xs text-muted-foreground">© 2026 ADEPA — Les Extras</p>
              <p className="text-xs text-muted-foreground flex items-center gap-1">Fait avec <Heart className="h-3 w-3 fill-[hsl(var(--primary)/0.55)] text-[hsl(var(--primary)/0.55)]" /> pour le médico-social</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

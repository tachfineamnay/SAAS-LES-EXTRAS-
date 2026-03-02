"use client";

import Link from "next/link";
import Image from "next/image";
import {
  motion, useScroll, useTransform, useMotionValue, useSpring, useInView,
  AnimatePresence,
} from "framer-motion";
import { useRef, useState, useEffect, useCallback } from "react";
import {
  ArrowRight, CheckCircle, ShieldCheck, Clock, Star, Zap,
  TrendingUp, Users, BadgeCheck, ArrowUpRight, CalendarDays,
  FileText, DollarSign, Heart, Briefcase,
  Lock, Sparkles, Quote,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatedNumber } from "@/components/ui/animated-number";
import { EASE_PREMIUM, SPRING_BOUNCY } from "@/lib/motion";

/* constants */
const DISPLAY = "font-[family-name:var(--font-display)]";
const MONO = "font-[family-name:var(--font-mono)]";

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.09, delayChildren: 0.1 } },
};
const rise = {
  hidden: { opacity: 0, y: 32 },
  show: { opacity: 1, y: 0, transition: { duration: 0.58, ease: EASE_PREMIUM } },
};

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
    <motion.div ref={el} style={{ rotateX: rx, rotateY: ry, transformPerspective: 1000 }}
      onMouseMove={move} onMouseLeave={leave} className={className}>
      {children}
    </motion.div>
  );
}

function Blob({ className, d = 0 }: { className: string; d?: number }) {
  return (
    <motion.div className={className}
      animate={{ x: [0, 20, -15, 0], y: [0, -18, 10, 0], scale: [1, 1.05, 0.96, 1] }}
      transition={{ duration: 22, delay: d, repeat: Infinity, ease: "easeInOut" }} />
  );
}

function LiveDashboardMock() {
  const missions = [
    { role: "IDE", place: "EHPAD Les Oliviers", time: "Demain 7h–15h", pay: "320€", urgent: true, match: 98 },
    { role: "AS", place: "Clinique St-Joseph", time: "Jeu. 8h–16h", pay: "245€", urgent: false, match: 91 },
    { role: "AES", place: "EHPAD Le Parc", time: "Ven. 14h–22h", pay: "210€", urgent: false, match: 87 },
  ];
  return (
    <div className="relative w-full max-w-[440px] mx-auto" aria-hidden="true">
      <div className="absolute -inset-8 rounded-[3rem] opacity-70 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at 40% 30%, hsl(174 58% 38% / 0.10), transparent 65%)" }} />
      <motion.div initial={{ opacity: 0, y: 45, rotate: 2 }} animate={{ opacity: 1, y: 0, rotate: 0.5 }}
        transition={{ delay: 0.4, duration: 0.9, type: "spring", stiffness: 70 }}>
        <Tilt className="glass-panel glass-highlight border border-white/25 shadow-glass-lg rounded-2xl overflow-hidden cursor-default">
          <div className="px-5 py-4 border-b border-white/15 flex items-center justify-between glass-panel-dense">
            <div className="flex items-center gap-2.5">
              <motion.div animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.8, repeat: Infinity }}
                className="h-2 w-2 rounded-full bg-[hsl(var(--emerald))]" />
              <span className={`${MONO} text-[11px] text-muted-foreground font-medium`}>MATCHING LIVE</span>
            </div>
            <span className={`${MONO} text-[10px] font-bold text-[hsl(var(--teal))]`}>3 nouvelles</span>
          </div>
          <div className="divide-y divide-white/10">
            {missions.map((m, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 + i * 0.18, duration: 0.5 }}
                className="px-5 py-3.5 flex items-center gap-3.5 hover:bg-[hsl(var(--surface-2))] transition-colors">
                <div className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ${m.urgent
                  ? "bg-[hsl(var(--coral-light))] border border-[hsl(var(--coral)/0.20)]"
                  : "bg-[hsl(var(--teal-light))] border border-[hsl(var(--teal)/0.15)]"}`}>
                  <Briefcase className={`h-3.5 w-3.5 ${m.urgent ? "text-[hsl(var(--coral))]" : "text-[hsl(var(--teal))]"}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-bold text-foreground">{m.role}</span>
                    {m.urgent && (
                      <motion.span animate={{ opacity: [1, 0.6, 1] }} transition={{ duration: 1.4, repeat: Infinity }}
                        className={`${MONO} text-[8px] font-bold bg-[hsl(var(--coral))] text-white px-1.5 py-0.5 rounded-full`}>
                        URGENT
                      </motion.span>
                    )}
                  </div>
                  <p className="text-[10px] text-muted-foreground truncate">{m.place} · {m.time}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className={`${MONO} text-xs font-bold text-[hsl(var(--emerald))]`}>{m.pay}</p>
                  <p className={`${MONO} text-[9px] text-[hsl(var(--teal))]`}>{m.match}%</p>
                </div>
              </motion.div>
            ))}
          </div>
          <div className="px-5 py-3 border-t border-white/15 glass-panel-dense flex items-center justify-between">
            <span className={`${MONO} text-[10px] text-muted-foreground`}>Confirmé moyen :</span>
            <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.2 }}
              className={`${MONO} text-xs font-bold text-[hsl(var(--coral))]`}>47s ⚡</motion.span>
          </div>
        </Tilt>
      </motion.div>
      <motion.div initial={{ opacity: 0, scale: 0.5, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ delay: 2.6, type: "spring", stiffness: 260, damping: 16 }}
        className="absolute -bottom-5 -left-5 flex items-center gap-2 glass-panel shadow-glass border border-white/25 px-4 py-2.5 rounded-full">
        <motion.div animate={{ rotate: [0, 360] }} transition={{ delay: 2.8, duration: 0.45 }}>
          <CheckCircle className="h-4 w-4 text-[hsl(var(--emerald))]" />
        </motion.div>
        <span className="text-xs font-bold text-[hsl(var(--emerald))]">Mission confirmée</span>
        <span className={`${MONO} text-[10px] text-muted-foreground`}>47s</span>
      </motion.div>
    </div>
  );
}

function Feature({ icon: Icon, title, desc, accent = "teal", span, small }: {
  icon: React.ComponentType<{ className?: string }>;
  title: string; desc: string; accent?: "teal" | "coral"; span?: string; small?: boolean;
}) {
  const isTeal = accent === "teal";
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mouse-x", `${e.clientX - rect.left}px`);
    e.currentTarget.style.setProperty("--mouse-y", `${e.clientY - rect.top}px`);
  }, []);
  return (
    <motion.div variants={rise} className={span}>
      <Tilt className={`group relative overflow-hidden rounded-2xl p-6 ${small ? "sm:p-6" : "sm:p-8"} h-full
        glass-panel glass-highlight card-spotlight border border-white/30 shadow-glass
        transition-all duration-300 hover:-translate-y-1.5 hover:shadow-glass-lg hover:border-[hsl(var(--teal)/0.18)] cursor-default`}>
        <div className={`absolute -top-16 -right-16 h-44 w-44 rounded-full blur-3xl opacity-0
          group-hover:opacity-100 transition-opacity duration-700
          ${isTeal ? "bg-[hsl(var(--teal)/0.12)]" : "bg-[hsl(var(--coral)/0.12)]"}`} />
        <div className="relative z-10 flex flex-col h-full" onMouseMove={handleMouseMove}>
          <motion.div whileHover={{ rotate: [0, -8, 8, -4, 0], scale: 1.15 }} transition={SPRING_BOUNCY}
            className={`h-12 w-12 rounded-xl flex items-center justify-center mb-5 ring-1 ${isTeal
              ? "icon-teal ring-[hsl(var(--teal)/0.15)]"
              : "icon-coral ring-[hsl(var(--coral)/0.15)]"}`}>
            <Icon className="h-5 w-5" />
          </motion.div>
          <h3 className={`${DISPLAY} font-bold text-foreground mb-2.5 text-base`}>{title}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
        </div>
      </Tilt>
    </motion.div>
  );
}

function Stat({ value, label, suffix }: { value: number; label: string; suffix?: string }) {
  return (
    <motion.div variants={rise}
      className="flex flex-col items-center gap-2 px-6 sm:px-10 py-5 rounded-2xl glass-panel-subtle border border-white/20 shadow-glass-sm">
      <span className={`${MONO} text-3xl sm:text-4xl font-bold tabular-nums tracking-tight text-foreground`}>
        <AnimatedNumber value={value} />
        {suffix && <span className="text-[hsl(var(--teal))]">{suffix}</span>}
      </span>
      <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.18em]">{label}</span>
    </motion.div>
  );
}

function Step({ n, title, desc }: { n: string; title: string; desc: string }) {
  return (
    <motion.div variants={rise}
      className="relative flex flex-col items-start gap-4 glass-panel rounded-2xl p-6 sm:p-7 border border-white/25 shadow-glass
        hover:shadow-glass-lg hover:-translate-y-1 transition-all duration-300">
      <div className="flex items-center gap-4 w-full">
        <motion.div whileHover={{ scale: 1.15, rotate: 5 }} transition={SPRING_BOUNCY}
          className={`${MONO} h-10 w-10 rounded-xl bg-gradient-to-br from-[hsl(var(--teal))] to-[hsl(var(--teal)/0.7)] text-white flex items-center justify-center text-sm font-bold shrink-0 shadow-md`}>{n}</motion.div>
        <div className="flex-1 h-px bg-gradient-to-r from-[hsl(var(--teal)/0.35)] via-[hsl(var(--teal)/0.15)] to-transparent" />
      </div>
      <h3 className={`${DISPLAY} font-bold text-foreground text-lg`}>{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
    </motion.div>
  );
}

function Testimonial({ quote, name, role, rating }: { quote: string; name: string; role: string; rating: number }) {
  return (
    <motion.div variants={rise}>
      <Tilt className="glass-panel glass-highlight border border-white/25 shadow-glass rounded-2xl p-7 flex flex-col gap-4 h-full
        hover:shadow-glass-lg hover:-translate-y-1 transition-all duration-300 cursor-default">
        <div className="flex items-center justify-between">
          <div className="flex gap-0.5">
            {Array.from({ length: rating }).map((_, i) => (
              <motion.div key={i} initial={{ opacity: 0, scale: 0 }} whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }} transition={{ delay: i * 0.06, type: "spring", stiffness: 280 }}>
                <Star className="h-4 w-4 fill-[hsl(var(--amber))] text-[hsl(var(--amber))]" />
              </motion.div>
            ))}
          </div>
          <Quote className="h-5 w-5 text-[hsl(var(--teal)/0.25)]" />
        </div>
        <p className="text-sm text-foreground/80 leading-relaxed italic">&ldquo;{quote}&rdquo;</p>
        <div className="mt-auto pt-4 border-t border-white/15">
          <p className="text-sm font-bold text-foreground">{name}</p>
          <p className="text-xs text-muted-foreground">{role}</p>
        </div>
      </Tilt>
    </motion.div>
  );
}

export default function HomePage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 160]);
  const heroO = useTransform(scrollYProgress, [0, 0.4], [1, 0]);

  return (
    <div className="relative min-h-screen bg-background text-foreground overflow-x-hidden">
      <div className="pointer-events-none fixed inset-0 z-0 dot-grid opacity-100" aria-hidden="true" />
      <div className="pointer-events-none fixed inset-0 z-0 bg-ambient-top" aria-hidden="true" />
      <div className="pointer-events-none fixed inset-0 z-0" aria-hidden="true">
        <Blob className="absolute -top-40 right-[5%] w-[700px] h-[700px] rounded-full bg-gradient-to-br from-[hsl(var(--teal)/0.08)] to-transparent blur-3xl" d={0} />
        <Blob className="absolute top-[55%] -left-40 w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-[hsl(var(--teal)/0.05)] to-transparent blur-3xl" d={7} />
        <Blob className="absolute bottom-[8%] right-[20%] w-[400px] h-[400px] rounded-full bg-gradient-to-tl from-[hsl(var(--coral)/0.06)] to-transparent blur-3xl" d={12} />
      </div>

      <div className="relative z-10">
        {/* NAVBAR */}
        <motion.header initial={{ y: -16, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.05 }} className="fixed top-0 z-50 w-full">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-3">
            <nav className="flex h-14 items-center justify-between rounded-2xl glass-panel glass-highlight border border-white/30 px-5 shadow-glass">
              <Link href="/">
                <Image src="/logo-adepa.png" alt="ADEPA Les Extras" width={110} height={36}
                  className="h-8 w-auto object-contain" priority />
              </Link>
              <div className="hidden md:flex items-center gap-7">
                {[{ l: "Plateforme", h: "#fonctionnalites" }, { l: "Indépendants", h: "#independants" }, { l: "Avis", h: "#temoignages" }].map(n => (
                  <Link key={n.l} href={n.h}
                    className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors relative group">
                    {n.l}
                    <span className="absolute -bottom-0.5 left-0 w-0 h-[1.5px] rounded-full bg-[hsl(var(--teal))] group-hover:w-full transition-all duration-300" />
                  </Link>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <Button asChild variant="ghost" size="sm" className="text-sm font-semibold hidden sm:inline-flex">
                  <Link href="/login">Se connecter</Link>
                </Button>
                <Button asChild size="sm" variant="coral">
                  <Link href="/register">Démarrer <ArrowRight className="ml-1.5 h-3.5 w-3.5" /></Link>
                </Button>
              </div>
            </nav>
          </div>
        </motion.header>

        <main>
          {/* HERO */}
          <section ref={heroRef} className="relative min-h-screen flex items-center pt-28 pb-20 px-6 lg:pt-32">
            <motion.div style={{ y: heroY, opacity: heroO }} className="mx-auto max-w-7xl w-full">
              <div className="flex flex-col lg:flex-row lg:items-center lg:gap-20">
                <div className="flex-1 max-w-[600px]">
                  <motion.div initial={{ opacity: 0, y: 12, scale: 0.92 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.4, type: "spring" }}
                    className="inline-flex items-center gap-2.5 rounded-full glass-panel border border-[hsl(var(--teal)/0.20)] px-4 py-1.5 mb-8 shadow-glass-sm animate-[glass-shimmer_3s_ease-in-out_infinite]">
                    <motion.div animate={{ opacity: [1, 0.2, 1] }} transition={{ duration: 1.6, repeat: Infinity }}
                      className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--emerald))]" />
                    <span className={`${MONO} text-[11px] text-[hsl(var(--teal))]`}>
                      <Sparkles className="inline h-3 w-3 mr-1 -mt-0.5" />
                      Plateforme <span className="font-bold">#1</span> du médico-social — France
                    </span>
                  </motion.div>

                  <motion.h1 initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.65, delay: 0.1 }}
                    className={`${DISPLAY} text-[clamp(2.4rem,5vw,4.4rem)] font-extrabold tracking-tight leading-[1.07]`}>
                    <span className="text-foreground">Un soignant absent ?</span>
                    <br />
                    <span className="relative inline-block mt-2">
                      <span className="bg-gradient-to-r from-[hsl(var(--teal))] to-[hsl(var(--teal)/0.75)] bg-clip-text text-transparent">Remplacé en 47</span>
                      <br />
                      <span className="bg-gradient-to-r from-[hsl(var(--coral))] to-[hsl(var(--coral)/0.7)] bg-clip-text text-transparent">secondes.</span>
                      <motion.span initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
                        transition={{ delay: 1.1, duration: 0.5, ease: "easeOut" }}
                        className="absolute -bottom-2 left-0 right-0 h-[3px] rounded-full origin-left bg-gradient-to-r from-[hsl(var(--teal))] via-[hsl(var(--coral)/0.7)] to-[hsl(var(--coral))]" />
                    </span>
                  </motion.h1>

                  <motion.p initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.25 }}
                    className="mt-7 text-lg text-muted-foreground max-w-[500px] leading-relaxed">
                    Publiez votre besoin en{" "}
                    <strong className="text-foreground font-semibold">30 secondes</strong>.
                    Des professionnels vérifiés postulent{" "}
                    <strong className="text-foreground font-semibold">en un clic</strong>.
                    Contrats &amp; facturation{" "}
                    <strong className="text-foreground font-semibold">100% automatiques</strong>.
                  </motion.p>

                  <motion.div initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.38 }}
                    className="mt-9 flex flex-col sm:flex-row gap-3">
                    <motion.div whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }} transition={SPRING_BOUNCY}>
                      <Button asChild size="lg" variant="coral"
                        className={`${DISPLAY} h-13 px-8 text-base font-semibold rounded-xl w-full sm:w-auto shadow-lg shadow-[hsl(var(--coral)/0.25)]`}>
                        <Link href="/register?role=CLIENT">Trouver un renfort <ArrowRight className="ml-2 h-4 w-4" /></Link>
                      </Button>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }} transition={SPRING_BOUNCY}>
                      <Button asChild size="lg" variant="teal-soft"
                        className={`${DISPLAY} h-13 px-8 text-base font-semibold rounded-xl w-full sm:w-auto shadow-lg shadow-[hsl(var(--teal)/0.15)]`}>
                        <Link href="/register?role=TALENT">Je suis indépendant</Link>
                      </Button>
                    </motion.div>
                  </motion.div>

                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.65 }}
                    className="mt-8 flex items-center gap-5 flex-wrap">
                    {[
                      { icon: BadgeCheck, label: "Inscription gratuite", c: "text-[hsl(var(--emerald))]" },
                      { icon: ShieldCheck, label: "Profils vérifiés", c: "text-[hsl(var(--teal))]" },
                      { icon: Lock, label: "Zéro paperasse", c: "text-muted-foreground" },
                    ].map((t, i) => (
                      <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.72 + i * 0.09 }}
                        className={`flex items-center gap-1.5 text-xs text-muted-foreground ${i === 2 ? "hidden sm:flex" : ""}`}>
                        <t.icon className={`h-3.5 w-3.5 ${t.c}`} />
                        <span>{t.label}</span>
                      </motion.div>
                    ))}
                  </motion.div>
                </div>

                <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3, duration: 0.85, type: "spring", stiffness: 65 }}
                  className="flex-1 mt-16 lg:mt-0 flex justify-center">
                  <LiveDashboardMock />
                </motion.div>
              </div>
            </motion.div>
          </section>

          {/* STATS */}
          <section className="py-14 relative overflow-hidden px-6">
            <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-30px" }}
              className="relative z-10 mx-auto max-w-5xl grid grid-cols-2 md:grid-cols-4 gap-4">
              <Stat value={2847} label="Missions ce mois" />
              <Stat value={47} label="Secondes de match" suffix="s" />
              <Stat value={98} label="Taux de satisfaction" suffix="%" />
              <Stat value={0} label="Frais d'inscription" suffix="€" />
            </motion.div>
          </section>

          {/* FEATURES */}
          <section id="fonctionnalites" className="py-28 px-6">
            <div className="mx-auto max-w-7xl">
              <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.5 }} className="text-center mb-16">
                <div className={`${MONO} inline-flex items-center gap-2 text-[11px] font-medium text-[hsl(var(--teal))] mb-5
                  px-3 py-1.5 rounded-full border border-[hsl(var(--teal)/0.20)] glass-panel-subtle shadow-glass-sm`}>
                  <Sparkles className="h-3 w-3" />
                  Comment ça marche
                </div>
                <h2 className={`${DISPLAY} text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground mb-5 leading-[1.10]`}>
                  De l&apos;urgence à la solution.<br />
                  <span className="bg-gradient-to-r from-[hsl(var(--teal))] to-[hsl(var(--teal)/0.7)] bg-clip-text text-transparent">En quelques minutes.</span>
                </h2>
                <p className="text-lg text-muted-foreground max-w-lg mx-auto">
                  Tout ce dont un directeur a besoin, dans une seule interface.
                </p>
              </motion.div>
              <motion.div variants={stagger} initial="hidden" whileInView="show"
                viewport={{ once: true, margin: "-50px" }} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Feature icon={Zap} title="Publication instantanée"
                  desc="Décrivez votre besoin en 30 secondes. Notre algorithme alerte les profils qualifiés dans un rayon de 30 km."
                  accent="teal" span="md:col-span-2" />
                <Feature icon={Users} title="Matching intelligent"
                  desc="Diplômes, disponibilités, distance, avis. On filtre — vous choisissez." accent="coral" />
                <Feature icon={Clock} title="Confirmation temps réel"
                  desc="Le professionnel postule, vous confirmez. 47 secondes en moyenne." accent="teal" />
                <Feature icon={FileText} title="Contrats auto-générés"
                  desc="Contrats, heures et factures générés automatiquement. Conformité totale." accent="coral" />
                <Feature icon={ShieldCheck} title="Profils 100% vérifiés"
                  desc="Diplômes vérifiés, ADELI/RPPS, expérience et avis — zéro risque." accent="teal" />
              </motion.div>
            </div>
          </section>

          {/* 3 STEPS */}
          <section className="py-20 px-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-[hsl(var(--surface-2))] border-y border-border" />
            <div className="relative z-10 mx-auto max-w-5xl">
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} className="text-center mb-14">
                <h2 className={`${DISPLAY} text-2xl sm:text-4xl font-extrabold text-foreground`}>
                  3 étapes, <span className="bg-gradient-to-r from-[hsl(var(--coral))] to-[hsl(var(--coral)/0.7)] bg-clip-text text-transparent">zéro friction.</span>
                </h2>
              </motion.div>
              <motion.div variants={stagger} initial="hidden" whileInView="show"
                viewport={{ once: true, margin: "-40px" }} className="grid grid-cols-1 md:grid-cols-3 gap-10">
                <Step n="01" title="Publiez le besoin"
                  desc="Poste, date, horaires, établissement. 30 secondes, formulaire guidé." />
                <Step n="02" title="Recevez les candidatures"
                  desc="Les extras locaux vérifiés postulent. Consultez leurs profils complets en un clic." />
                <Step n="03" title="Confirmez et c'est fait"
                  desc="Cliquez Confirmer. Contrat et accès générés automatiquement. 47s en moyenne." />
              </motion.div>
            </div>
          </section>

          {/* FREELANCE */}
          <section id="independants" className="py-28 px-6">
            <div className="mx-auto max-w-7xl">
              <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.65 }}
                className="relative rounded-2xl overflow-hidden glass-panel border border-white/25 shadow-glass-lg">
                <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[hsl(var(--teal))] via-[hsl(var(--teal-mid))] to-[hsl(var(--coral))] animate-[border-flow_4s_ease_infinite]" />
                <div className="absolute top-0 right-0 w-[500px] h-[400px] bg-gradient-to-bl from-[hsl(var(--teal)/0.05)] to-transparent rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[300px] bg-gradient-to-tr from-[hsl(var(--coral)/0.04)] to-transparent rounded-full blur-3xl pointer-events-none" />
                <div className="relative z-10 p-8 sm:p-14">
                  <div className="flex flex-col lg:flex-row items-start gap-12 lg:gap-20">
                    <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.1 }}
                      className="flex-1 space-y-6 max-w-xl">
                      <div className={`${MONO} inline-flex items-center gap-2 text-[11px] font-medium text-[hsl(var(--teal))]
                        px-3 py-1.5 rounded-full border border-[hsl(var(--teal)/0.20)] glass-panel-subtle shadow-glass-sm`}>
                        Espace Indépendants
                      </div>
                      <h2 className={`${DISPLAY} text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground leading-tight`}>
                        Votre talent mérite{" "}
                        <span className="bg-gradient-to-r from-[hsl(var(--teal))] to-[hsl(var(--teal)/0.7)] bg-clip-text text-transparent">mieux qu&apos;un planning vide.</span>
                      </h2>
                      <p className="text-lg text-muted-foreground leading-relaxed">
                        Rejoignez un réseau de soignants indépendants qui choisissent leurs missions et maximisent leurs revenus.
                      </p>
                      <div className="space-y-3 pt-1">
                        {[
                          { icon: Zap, text: "Fast-Apply : postulez en 1 seconde" },
                          { icon: FileText, text: "Factures et contrats auto-générés" },
                          { icon: TrendingUp, text: "Vos ateliers sur la marketplace" },
                          { icon: DollarSign, text: "Paiement garanti sous 72h" },
                        ].map((item, i) => (
                          <motion.div key={i} initial={{ opacity: 0, x: -14 }} whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }} transition={{ delay: 0.2 + i * 0.08 }}
                            className="flex items-start gap-3">
                            <div className="h-7 w-7 rounded-lg icon-teal flex items-center justify-center shrink-0 mt-0.5">
                              <item.icon className="h-3.5 w-3.5" />
                            </div>
                            <span className="text-sm font-medium text-foreground/85">{item.text}</span>
                          </motion.div>
                        ))}
                      </div>
                      <div className="pt-2 flex items-center gap-4">
                        <motion.div whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }} transition={SPRING_BOUNCY}>
                          <Button asChild size="lg" variant="coral"
                            className={`${DISPLAY} h-12 px-7 text-sm font-semibold rounded-xl shadow-lg shadow-[hsl(var(--coral)/0.25)]`}>
                            <Link href="/register?role=TALENT">
                              Créer mon profil gratuit <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                          </Button>
                        </motion.div>
                      </div>
                      <p className={`${MONO} text-[10px] font-semibold text-muted-foreground uppercase tracking-widest`}>
                        Commission 0% · 100 premières inscriptions
                      </p>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 35, rotate: 2 }} whileInView={{ opacity: 1, y: 0, rotate: 0.8 }}
                      viewport={{ once: true }} transition={{ duration: 0.7, delay: 0.2, type: "spring", stiffness: 75 }}
                      className="flex-1 w-full hidden lg:block" aria-hidden="true">
                      <Tilt className="glass-panel glass-highlight border border-white/25 shadow-glass rounded-2xl p-6 cursor-default">
                        <div className="flex items-center justify-between mb-5 pb-4 border-b border-border">
                          <div className="flex items-center gap-2.5">
                            <div className="h-8 w-8 rounded-lg icon-teal flex items-center justify-center">
                              <TrendingUp className="h-4 w-4" />
                            </div>
                            <div>
                              <div className="h-2.5 w-20 rounded-full bg-foreground/10" />
                              <div className="h-2 w-14 rounded-full bg-foreground/6 mt-1.5" />
                            </div>
                          </div>
                          <span className={`${MONO} text-[9px] font-semibold text-[hsl(var(--emerald))] px-2 py-0.5 rounded-full border border-[hsl(var(--emerald)/0.25)] bg-[hsl(var(--emerald-light))]`}>
                            En ligne
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-2.5 mb-5">
                          {[
                            { l: "CA mois", v: "2 840€", c: "text-[hsl(var(--emerald))]" },
                            { l: "Missions", v: "12", c: "text-foreground" },
                            { l: "Note", v: "4.9★", c: "text-[hsl(var(--amber))]" },
                          ].map((k, i) => (
                            <motion.div key={i} initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }}
                              viewport={{ once: true }} transition={{ delay: 0.4 + i * 0.08 }}
                              className="rounded-xl bg-[hsl(var(--surface-2))] border border-border p-3">
                              <p className="text-[9px] text-muted-foreground mb-0.5">{k.l}</p>
                              <p className={`${MONO} text-sm font-semibold ${k.c}`}>{k.v}</p>
                            </motion.div>
                          ))}
                        </div>
                        {[
                          { t: "IDE", p: "EHPAD Les Oliviers", pay: "320€", u: true },
                          { t: "AS", p: "Clinique Saint-Joseph", pay: "245€", u: false },
                        ].map((m, i) => (
                          <motion.div key={i} initial={{ opacity: 0, x: 12 }} whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }} transition={{ delay: 0.55 + i * 0.12 }}
                            className="rounded-xl bg-[hsl(var(--surface-2))] border border-border p-3.5 mb-2.5 flex items-center gap-3">
                            <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0
                              ${m.u ? "icon-coral" : "bg-[hsl(var(--surface-2))] text-muted-foreground border border-border"}`}>
                              <CalendarDays className="h-4 w-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5">
                                <p className="text-xs font-bold text-foreground">{m.t}</p>
                                {m.u && <span className={`${MONO} text-[8px] font-bold bg-[hsl(var(--coral))] text-white px-1.5 py-0.5 rounded-full`}>URGENT</span>}
                              </div>
                              <p className="text-[10px] text-muted-foreground truncate">{m.p}</p>
                            </div>
                            <span className={`${MONO} text-xs font-semibold text-[hsl(var(--emerald))] shrink-0`}>{m.pay}</span>
                          </motion.div>
                        ))}
                      </Tilt>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            </div>
          </section>

          {/* TESTIMONIALS */}
          <section id="temoignages" className="py-24 px-6">
            <div className="mx-auto max-w-7xl">
              <motion.div initial={{ opacity: 0, y: 22 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} className="text-center mb-14">
                <div className={`${MONO} inline-flex items-center gap-2 text-[11px] font-medium text-muted-foreground
                  px-3 py-1.5 rounded-full glass-panel-subtle border border-white/20 shadow-glass-sm mb-5`}>
                  <Star className="h-3 w-3 fill-[hsl(var(--amber))] text-[hsl(var(--amber))]" />
                  Ce qu&apos;ils en disent
                </div>
                <h2 className={`${DISPLAY} text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground leading-tight`}>
                  Adopté par des centaines{" "}
                  <span className="bg-gradient-to-r from-[hsl(var(--teal))] to-[hsl(var(--teal)/0.7)] bg-clip-text text-transparent">d&apos;établissements.</span>
                </h2>
              </motion.div>
              <motion.div variants={stagger} initial="hidden" whileInView="show"
                viewport={{ once: true, margin: "-50px" }} className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <Testimonial quote="On est passé de 4h de téléphone à 47 secondes. Les Extras a sauvé nos week-ends."
                  name="Dr. Marie-Claire Dubois" role="Directrice · EHPAD La Résidence du Parc" rating={5} />
                <Testimonial quote="Interface d'une clarté absolue. Mes cadres n'ont eu besoin d'aucune formation."
                  name="Thomas Bergeron" role="DRH · Groupe Santé Horizon" rating={5} />
                <Testimonial quote="En 3 mois j'ai doublé mes revenus. Le Fast-Apply me laisse me concentrer sur mes patients."
                  name="Sophie Martin" role="Infirmière IDE · Freelance" rating={5} />
              </motion.div>
            </div>
          </section>

          {/* CTA FINAL */}
          <section className="py-20 px-6">
            <div className="mx-auto max-w-4xl">
              <motion.div initial={{ opacity: 0, y: 30, scale: 0.97 }} whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true }} transition={{ duration: 0.6, type: "spring" }}
                className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-[hsl(var(--teal))] via-[hsl(var(--teal)/0.95)] to-[hsl(var(--teal)/0.85)] text-white shadow-2xl">
                <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full bg-white/10 blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 -left-10 w-72 h-72 rounded-full bg-[hsl(var(--coral)/0.3)] blur-3xl pointer-events-none" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-white/[0.04] blur-3xl pointer-events-none" />
                <motion.div animate={{ x: ["-100%", "200%"] }}
                  transition={{ duration: 4, repeat: Infinity, repeatDelay: 5, ease: "easeInOut" }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.08] to-transparent skew-x-12 pointer-events-none" />
                <div className="relative z-10 p-10 sm:p-16 text-center">
                  <h2 className={`${DISPLAY} text-3xl sm:text-4xl font-extrabold tracking-tight mb-4`}>
                    Prêt à ne plus jamais{" "}
                    <span className="text-[hsl(var(--coral-mid))] drop-shadow-sm">manquer de personnel ?</span>
                  </h2>
                  <p className="text-lg text-white/75 max-w-lg mx-auto mb-9">
                    Rejoignez les établissements qui ont automatisé leur recrutement temporaire.
                  </p>
                  <div className="flex flex-col sm:flex-row justify-center gap-3">
                    <motion.div whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.97 }} transition={SPRING_BOUNCY}>
                      <Button asChild size="lg" variant="coral"
                        className={`${DISPLAY} h-13 px-8 text-base font-semibold rounded-xl w-full sm:w-auto shadow-xl shadow-[hsl(var(--coral)/0.45)]`}>
                        <Link href="/register?role=CLIENT">Commencer gratuitement <ArrowRight className="ml-2 h-4 w-4" /></Link>
                      </Button>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.97 }} transition={SPRING_BOUNCY}>
                      <Button asChild size="lg"
                        className={`${DISPLAY} h-13 px-8 text-base font-semibold rounded-xl bg-white/15 backdrop-blur-sm text-white border border-white/30 hover:bg-white/25 w-full sm:w-auto`}>
                        <Link href="/register?role=TALENT">Espace indépendant <ArrowUpRight className="ml-1.5 h-4 w-4" /></Link>
                      </Button>
                    </motion.div>
                  </div>
                  <p className={`${MONO} mt-6 text-[11px] text-white/55 font-medium`}>
                    Pas de carte · 2 min · Support prioritaire
                  </p>
                </div>
              </motion.div>
            </div>
          </section>
        </main>

        {/* FOOTER */}
        <footer className="border-t border-white/15 py-10 px-6 glass-panel-dense">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-col md:flex-row justify-between items-start gap-10 mb-8">
              <div className="max-w-xs">
                <Link href="/" className="block mb-4">
                  <Image src="/logo-adepa.png" alt="ADEPA Les Extras" width={95} height={30} className="h-7 w-auto object-contain" />
                </Link>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Mise en relation premium pour le médico-social. Matching en temps réel.
                </p>
              </div>
              <div className="flex gap-14">
                <div>
                  <p className={`${MONO} text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-3`}>Plateforme</p>
                  <ul className="space-y-2">
                    <li><Link href="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Se connecter</Link></li>
                    <li><Link href="/register" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Inscription</Link></li>
                  </ul>
                </div>
                <div>
                  <p className={`${MONO} text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-3`}>Légal</p>
                  <ul className="space-y-2">
                    <li><Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Confidentialité</Link></li>
                    <li><Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">CGU</Link></li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="pt-6 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-3">
              <p className={`${MONO} text-xs text-muted-foreground`}>© 2026 ADEPA — Les Extras</p>
              <p className={`${MONO} text-xs text-muted-foreground flex items-center gap-1`}>
                Fait avec <Heart className="h-3 w-3 fill-[hsl(var(--coral)/0.6)] text-[hsl(var(--coral)/0.6)]" /> pour le médico-social
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

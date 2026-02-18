"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Briefcase, Building2, Calendar, CheckCircle, Search, Star, Users } from "lucide-react";
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
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500/30">
      {/* Header */}
      <header className="fixed top-0 z-50 w-full border-b border-white/5 bg-slate-950/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-indigo-600 bg-gradient-to-br from-indigo-500 to-violet-600" />
            <span className="text-xl font-bold tracking-tight">Les Extras</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/auth/login" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">
              Se connecter
            </Link>
            <Button asChild size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white border-0">
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
              className="text-4xl font-extrabold tracking-tight sm:text-6xl bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-400"
            >
              La plateforme des extras <br className="hidden sm:block" />
              <span className="text-indigo-500">simplifiée</span> et <span className="text-violet-500">efficace</span>.
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mt-6 text-lg text-slate-400 max-w-2xl mx-auto"
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
            <motion.div variants={item} className="group relative overflow-hidden rounded-3xl border border-white/10 bg-slate-900/50 p-8 hover:bg-slate-900/80 transition-all md:col-span-2">
              <div className="absolute top-0 right-0 -mt-16 -mr-16 h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl opacity-50 group-hover:opacity-100 transition-opacity" />

              <div className="relative h-full flex flex-col justify-between">
                <div>
                  <div className="h-12 w-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center mb-6 text-indigo-400">
                    <Briefcase className="h-6 w-6" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Je cherche des missions</h3>
                  <p className="text-slate-400 max-w-md">
                    Accédez à des centaines de missions dans le secteur médico-social.
                    Gérez votre emploi du temps et recevez vos paiements rapidement.
                  </p>
                </div>

                <div className="flex gap-4 mt-8">
                  <Button asChild className="bg-white text-slate-950 hover:bg-slate-200">
                    <Link href="/marketplace">Voir les missions</Link>
                  </Button>
                  <Button asChild variant="outline" className="border-white/10 text-slate-300 hover:bg-white/5 hover:text-white">
                    <Link href="/auth/register?role=TALENT">M'inscrire comme Talent</Link>
                  </Button>
                </div>
              </div>
            </motion.div>

            {/* Stat Card */}
            <motion.div variants={item} className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-indigo-950/30 to-slate-950 p-8 flex flex-col items-center justify-center text-center">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-500/10 via-slate-950/0 to-slate-950/0" />
              <div className="relative">
                <span className="text-5xl font-bold text-white tracking-tighter">100%</span>
                <p className="mt-2 text-sm font-medium text-indigo-400 uppercase tracking-widest">Transactionnel</p>
                <p className="mt-4 text-slate-400 text-sm">
                  Pas d'abonnement caché. <br />Vous ne payez que ce que vous utilisez.
                </p>
              </div>
            </motion.div>

            {/* Client Action */}
            <motion.div variants={item} className="group relative overflow-hidden rounded-3xl border border-white/10 bg-slate-900/50 p-8 hover:bg-slate-900/80 transition-all">
              <div className="absolute bottom-0 left-0 -mb-16 -ml-16 h-64 w-64 rounded-full bg-violet-500/20 blur-3xl opacity-30 group-hover:opacity-80 transition-opacity" />

              <div className="relative h-full flex flex-col justify-between">
                <div className="h-12 w-12 rounded-2xl bg-violet-500/20 flex items-center justify-center mb-6 text-violet-400">
                  <Building2 className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Je recrute des extras</h3>
                  <p className="text-slate-400 text-sm">
                    Trouvez des profils vérifiés pour vos besoins ponctuels.
                    Facturation simplifiée et transparente.
                  </p>
                </div>
                <Button asChild className="mt-6 w-full bg-violet-600 hover:bg-violet-700 text-white">
                  <Link href="/auth/register?role=CLIENT">Publier une mission</Link>
                </Button>
              </div>
            </motion.div>

            {/* Features / Bento Items */}
            <motion.div variants={item} className="md:col-span-2 relative overflow-hidden rounded-3xl border border-white/10 bg-slate-900/30 p-8">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 h-full items-center">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-white font-medium">
                    <CheckCircle className="h-5 w-5 text-emerald-500" />
                    <span>Vérifié</span>
                  </div>
                  <p className="text-sm text-slate-500">Tous nos talents sont vérifiés par nos équipes.</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-white font-medium">
                    <Calendar className="h-5 w-5 text-blue-500" />
                    <span>Flexible</span>
                  </div>
                  <p className="text-sm text-slate-500">Gérez vos plannings en temps réel.</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-white font-medium">
                    <Star className="h-5 w-5 text-amber-500" />
                    <span>Qualité</span>
                  </div>
                  <p className="text-sm text-slate-500">Notez et soyez noté après chaque mission.</p>
                </div>
              </div>
            </motion.div>

          </motion.div>
        </div>
      </main>

      <footer className="border-t border-white/5 bg-slate-950 py-12 px-6">
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row justify-between items-center gap-6 text-slate-500 text-sm">
          <p>© 2024 Les Extras. Tous droits réservés.</p>
          <div className="flex gap-6">
            <Link href="#" className="hover:text-white transition-colors">Politique de confidentialité</Link>
            <Link href="#" className="hover:text-white transition-colors">CGU</Link>
            <Link href="#" className="hover:text-white transition-colors">Mentions légales</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function WelcomePage() {
    return (
        <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center px-4">
            <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="glass-panel w-full max-w-lg rounded-2xl p-10 text-center card-shadow-md"
            >
                {/* Icon */}
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 15 }}
                    className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-[hsl(var(--teal)/0.12)] border border-[hsl(var(--teal)/0.2)]"
                >
                    <CheckCircle2 className="h-10 w-10 text-[hsl(var(--teal))]" />
                </motion.div>

                {/* Heading */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.4 }}
                    className="mb-6 space-y-2"
                >
                    <p className="text-xs font-semibold text-[hsl(var(--teal))] uppercase tracking-widest">
                        Compte créé avec succès
                    </p>
                    <h1 className="text-3xl font-bold tracking-tight text-[hsl(var(--text-primary))]">
                        Bienvenue !
                    </h1>
                    <p className="text-[hsl(var(--text-secondary))]">
                        Votre compte a été créé avec succès.
                    </p>
                </motion.div>

                {/* Body */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.45, duration: 0.4 }}
                    className="mb-8 space-y-3 text-sm text-[hsl(var(--text-secondary))] rounded-xl bg-[hsl(var(--surface-2))] p-4"
                >
                    <p>
                        Pour accéder à toutes les fonctionnalités de{" "}
                        <strong className="text-[hsl(var(--text-primary))]">Les Extras</strong>,
                        nous avons besoin de finaliser votre profil.
                    </p>
                    <p className="flex items-center justify-center gap-1.5">
                        <Sparkles className="h-4 w-4 text-[hsl(var(--coral))]" />
                        Cela ne prendra que <strong className="text-[hsl(var(--text-primary))]">2 minutes</strong>.
                    </p>
                </motion.div>

                {/* CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.55, duration: 0.3 }}
                >
                    <Button asChild size="lg" variant="coral" className="w-full text-base">
                        <Link href="/wizard">
                            Commencer <ArrowRight className="ml-2 h-5 w-5" />
                        </Link>
                    </Button>
                </motion.div>
            </motion.div>
        </div>
    );
}


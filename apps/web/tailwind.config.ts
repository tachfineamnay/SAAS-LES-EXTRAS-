import type { Config } from "tailwindcss";

const config: Config = {
  // Pas de darkMode — light only
  content: [
    "./src/pages/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: { "2xl": "1400px" },
    },
    extend: {
      fontFamily: {
        sans:    ["var(--font-body)", "Inter", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "Plus Jakarta Sans", "system-ui", "sans-serif"],
      },
      fontSize: {
        "display-xl": ["2.5rem",  { lineHeight: "1.1",  letterSpacing: "-0.03em",  fontWeight: "800" }],
        "display-lg": ["2rem",    { lineHeight: "1.15", letterSpacing: "-0.025em", fontWeight: "700" }],
        "heading":    ["1.25rem", { lineHeight: "1.3",  letterSpacing: "-0.015em", fontWeight: "600" }],
        "body-lg":    ["1rem",    { lineHeight: "1.6",  fontWeight: "400" }],
        "caption":    ["0.75rem", { lineHeight: "1.4",  letterSpacing: "0.02em",   fontWeight: "500" }],
      },
      colors: {
        /* ── Shadcn tokens ── */
        border:     "hsl(var(--border))",
        input:      "hsl(var(--input))",
        ring:       "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT:    "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT:    "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT:    "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT:    "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT:    "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT:    "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT:    "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },

        /* ── Brand tokens LES EXTRAS — Quietly Bold ── */

        /* Teal — Primary (confiance, soin, navigation) — vert profond médical */
        teal: {
          DEFAULT: "hsl(var(--teal))",
          dim:     "hsl(var(--teal-dim))",
          muted:   "hsl(var(--teal-muted))",
          50:      "hsla(170, 55%, 30%, 0.05)",
          100:     "hsla(170, 55%, 30%, 0.10)",
          200:     "hsla(170, 55%, 30%, 0.20)",
          500:     "hsl(170, 55%, 30%)",
          700:     "hsl(170, 48%, 22%)",
        },

        /* Coral → Terracotta — Action (CTA, urgence) */
        coral: {
          DEFAULT: "hsl(var(--coral))",
          dim:     "hsl(var(--coral-dim))",
          muted:   "hsl(var(--coral-muted))",
          50:      "hsla(14, 65%, 48%, 0.05)",
          100:     "hsla(14, 65%, 48%, 0.10)",
          200:     "hsla(14, 65%, 48%, 0.20)",
          500:     "hsl(14, 65%, 48%)",
          700:     "hsl(14, 58%, 36%)",
        },

        /* Sand — Chaleur, accueil, onboarding */
        sand: {
          DEFAULT: "hsl(var(--sand))",
          dim:     "hsl(var(--sand-dim))",
          muted:   "hsl(var(--sand-muted))",
          50:      "hsla(32, 75%, 50%, 0.05)",
          100:     "hsla(32, 75%, 50%, 0.10)",
          500:     "hsl(32, 75%, 50%)",
          700:     "hsl(32, 68%, 40%)",
        },

        /* Logo Gray — Neutre structural (du logo) */
        "logo-gray": {
          DEFAULT: "hsl(var(--logo-gray))",
          50:      "hsla(220, 10%, 56%, 0.08)",
          100:     "hsla(220, 10%, 56%, 0.14)",
          500:     "hsl(220, 10%, 56%)",
        },

        /* Emerald — Succès, validé */
        emerald: {
          DEFAULT: "hsl(var(--emerald))",
          50:      "hsla(145, 60%, 44%, 0.08)",
          100:     "hsla(145, 60%, 44%, 0.14)",
          500:     "hsl(145, 60%, 44%)",
        },

        /* Amber — Avertissement */
        amber: {
          DEFAULT: "hsl(var(--amber))",
          50:      "hsla(38, 92%, 52%, 0.08)",
          100:     "hsla(38, 92%, 52%, 0.14)",
          500:     "hsl(38, 92%, 52%)",
        },

        /* Surface secondaire */
        surface: {
          2: "hsl(var(--surface-2))",
        },
      },
      borderRadius: {
        sm:    "calc(var(--radius) - 4px)",
        md:    "calc(var(--radius) - 2px)",
        lg:    "var(--radius)",
        xl:    "calc(var(--radius) + 4px)",
        "2xl": "calc(var(--radius) + 8px)",
        "3xl": "1.5rem",
        "4xl": "2rem",
      },
      boxShadow: {
        /* Clinical card shadows — Quietly Bold */
        "card":       "0 1px 3px hsla(220,25%,15%,0.05), 0 4px 12px hsla(220,25%,15%,0.05)",
        "card-md":    "0 2px 8px hsla(220,25%,15%,0.06), 0 8px 24px hsla(220,25%,15%,0.07)",
        "card-lg":    "0 4px 16px hsla(220,25%,15%,0.08), 0 16px 48px hsla(220,25%,15%,0.09)",
        "card-hover": "0 8px 32px hsla(220,25%,15%,0.10), 0 2px 8px hsla(220,25%,15%,0.07)",
        /* Glow accents — updated for deeper palette */
        "glow-teal":  "0 0 0 3px hsl(170,45%,92%), 0 4px 20px hsla(170,55%,30%,0.22)",
        "glow-coral": "0 0 0 3px hsl(14,80%,94%), 0 4px 20px hsla(14,65%,48%,0.22)",
        "glow-sand":  "0 0 0 3px hsl(32,80%,93%), 0 4px 16px hsla(32,75%,50%,0.18)",
        /* Aliases */
        "warm-card":    "0 2px 12px hsla(220,25%,15%,0.07), 0 1px 3px hsla(220,25%,15%,0.04)",
        "warm-card-lg": "0 8px 32px hsla(220,25%,15%,0.10), 0 2px 8px hsla(220,25%,15%,0.06)",
        /* Glass shadows (kept for compat, reduced intensity) */
        "glass":    "0 8px 32px hsla(0,0%,0%,0.05), inset 0 1px 0 0 hsla(0,0%,100%,0.4)",
        "glass-lg": "0 12px 48px hsla(0,0%,0%,0.07), inset 0 1px 0 0 hsla(0,0%,100%,0.5)",
        "glass-sm": "0 4px 16px hsla(0,0%,0%,0.03), inset 0 1px 0 0 hsla(0,0%,100%,0.3)",
      },
      animation: {
        "fade-up":        "fade-up 0.5s cubic-bezier(0.16,1,0.3,1) both",
        "fade-in":        "fade-in 0.3s ease both",
        "scale-in":       "scale-in 0.3s cubic-bezier(0.16,1,0.3,1) both",
        "slide-in-left":  "slide-in-left 0.35s cubic-bezier(0.16,1,0.3,1) both",
        "float":          "float 4s ease-in-out infinite",
        "bounce-gentle":  "bounce-gentle 2s ease-in-out infinite",
        "pulse-ring-teal":  "pulse-ring-teal 2.2s ease infinite",
        "pulse-ring-coral": "pulse-ring-coral 2.2s ease infinite",
        "shimmer":        "shimmer 1.8s infinite",
        "glass-shimmer":  "glass-shimmer 2.5s ease-in-out infinite",
        "spotlight-pulse": "spotlight-pulse 3s ease-in-out infinite",
        "border-flow":    "border-flow 4s ease infinite",
        "count-up":       "count-up 0.4s cubic-bezier(0.22,1,0.36,1) both",
        "ripple":         "ripple-expand 0.6s ease forwards",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;

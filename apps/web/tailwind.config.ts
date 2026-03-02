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

        /* ── Brand tokens LES EXTRAS ── */

        /* Teal — Primary (confiance, soin, navigation) */
        teal: {
          DEFAULT: "hsl(var(--teal))",
          dim:     "hsl(var(--teal-dim))",
          muted:   "hsl(var(--teal-muted))",
          50:      "hsla(174, 64%, 42%, 0.05)",
          100:     "hsla(174, 64%, 42%, 0.10)",
          200:     "hsla(174, 64%, 42%, 0.20)",
          500:     "hsl(174, 64%, 42%)",
          700:     "hsl(174, 56%, 32%)",
        },

        /* Coral — Action (CTA, urgence, logo) */
        coral: {
          DEFAULT: "hsl(var(--coral))",
          dim:     "hsl(var(--coral-dim))",
          muted:   "hsl(var(--coral-muted))",
          50:      "hsla(5, 72%, 58%, 0.05)",
          100:     "hsla(5, 72%, 58%, 0.10)",
          200:     "hsla(5, 72%, 58%, 0.20)",
          500:     "hsl(5, 72%, 58%)",
          700:     "hsl(5, 60%, 44%)",
        },

        /* Sand — Chaleur, accueil, onboarding */
        sand: {
          DEFAULT: "hsl(var(--sand))",
          dim:     "hsl(var(--sand-dim))",
          muted:   "hsl(var(--sand-muted))",
          50:      "hsla(36, 80%, 58%, 0.05)",
          100:     "hsla(36, 80%, 58%, 0.10)",
          500:     "hsl(36, 80%, 58%)",
          700:     "hsl(36, 70%, 44%)",
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
        /* Warm card shadows (light mode) */
        "card":       "0 1px 3px hsla(222,47%,11%,0.06), 0 4px 12px hsla(222,47%,11%,0.06)",
        "card-md":    "0 2px 8px hsla(222,47%,11%,0.07), 0 8px 24px hsla(222,47%,11%,0.08)",
        "card-lg":    "0 4px 16px hsla(222,47%,11%,0.09), 0 16px 48px hsla(222,47%,11%,0.10)",
        "card-hover": "0 8px 32px hsla(222,47%,11%,0.12), 0 2px 8px hsla(222,47%,11%,0.08)",
        /* Glow accents */
        "glow-teal":  "0 0 0 3px hsl(174,72%,93%), 0 4px 20px hsla(174,58%,38%,0.22)",
        "glow-coral": "0 0 0 3px hsl(5,96%,95%), 0 4px 20px hsla(5,72%,58%,0.22)",
        "glow-sand":  "0 0 0 3px hsl(36,100%,94%), 0 4px 16px hsla(36,90%,56%,0.18)",
        /* Aliases */
        "warm-card":    "0 2px 12px hsla(222,47%,11%,0.08), 0 1px 3px hsla(222,47%,11%,0.05)",
        "warm-card-lg": "0 8px 32px hsla(222,47%,11%,0.12), 0 2px 8px hsla(222,47%,11%,0.07)",
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
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;

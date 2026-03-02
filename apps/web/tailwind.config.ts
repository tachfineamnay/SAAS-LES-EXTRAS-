import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
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
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans:    ["Inter", "system-ui", "sans-serif"],
        display: ["Plus Jakarta Sans", "system-ui", "sans-serif"],
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
        lg:   "var(--radius)",
        md:   "calc(var(--radius) - 2px)",
        sm:   "calc(var(--radius) - 4px)",
        xl:   "calc(var(--radius) + 4px)",
        "2xl": "calc(var(--radius) + 8px)",
      },
      boxShadow: {
        "warm-card":  "0 2px 12px hsla(215, 40%, 2%, 0.30), 0 1px 3px hsla(215, 40%, 2%, 0.12)",
        "warm-card-lg": "0 8px 32px hsla(215, 40%, 2%, 0.40), 0 2px 8px hsla(215, 40%, 2%, 0.16)",
        "glow-teal":  "0 0 24px hsla(174, 64%, 42%, 0.22), 0 4px 16px hsla(174, 64%, 42%, 0.10)",
        "glow-coral": "0 0 24px hsla(5, 72%, 58%, 0.22),   0 4px 16px hsla(5, 72%, 58%, 0.10)",
        "glow-sand":  "0 0 20px hsla(36, 80%, 58%, 0.18),  0 4px 12px hsla(36, 80%, 58%, 0.08)",
      },
      animation: {
        "fade-up":        "fade-up 0.4s ease both",
        "slide-in-left":  "slide-in-left 0.3s ease both",
        "float":          "float 6s ease-in-out infinite",
        "float-reverse":  "float-reverse 7s ease-in-out infinite",
        "pulse-ring-teal":  "pulse-ring-teal 2s ease infinite",
        "pulse-ring-coral": "pulse-ring-coral 2s ease infinite",
        "skeleton":         "shimmer-dark 1.8s infinite",
        "border-glow":      "border-glow-pulse 3s ease infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;

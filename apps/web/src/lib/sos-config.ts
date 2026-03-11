import {
  Stethoscope,
  Heart,
  BookOpen,
  Users,
  Baby,
  Brain,
  ChefHat,
  Moon,
  Settings,
  Briefcase,
  type LucideIcon,
} from "lucide-react";

export type MetierCategory = "soin" | "educatif" | "support";

export interface Metier {
  id: string;
  label: string;
  icon: LucideIcon;
  category: MetierCategory;
}

export const METIERS: Metier[] = [
  // Soin
  {
    id: "aide-soignant",
    label: "Aide-soignant(e)",
    icon: Heart,
    category: "soin",
  },
  {
    id: "infirmier",
    label: "Infirmier(ère)",
    icon: Stethoscope,
    category: "soin",
  },
  {
    id: "amp-aes",
    label: "AMP / AES",
    icon: Users,
    category: "soin",
  },
  {
    id: "accompagnant-educatif",
    label: "Accompagnant(e) éducatif et social",
    icon: Baby,
    category: "soin",
  },
  // Éducatif
  {
    id: "educateur-specialise",
    label: "Éducateur(trice) spécialisé(e)",
    icon: BookOpen,
    category: "educatif",
  },
  {
    id: "moniteur-educateur",
    label: "Moniteur(trice)-éducateur(trice)",
    icon: BookOpen,
    category: "educatif",
  },
  {
    id: "psychologue",
    label: "Psychologue",
    icon: Brain,
    category: "educatif",
  },
  {
    id: "chef-de-service",
    label: "Chef de service",
    icon: Briefcase,
    category: "educatif",
  },
  // Support
  {
    id: "maitresse-de-maison",
    label: "Maîtresse de maison",
    icon: Settings,
    category: "support",
  },
  {
    id: "agent-de-service",
    label: "Agent de service",
    icon: Settings,
    category: "support",
  },
  {
    id: "cuisinier",
    label: "Cuisinier(ère)",
    icon: ChefHat,
    category: "support",
  },
  {
    id: "veilleur-de-nuit",
    label: "Veilleur(euse) de nuit",
    icon: Moon,
    category: "support",
  },
];

export const METIERS_BY_CATEGORY: Record<MetierCategory, Metier[]> = {
  soin: METIERS.filter((m) => m.category === "soin"),
  educatif: METIERS.filter((m) => m.category === "educatif"),
  support: METIERS.filter((m) => m.category === "support"),
};

export const CATEGORY_LABELS: Record<MetierCategory, string> = {
  soin: "Soins",
  educatif: "Éducatif",
  support: "Support",
};

export const HOURLY_RATE_MIN = 15;
export const HOURLY_RATE_MAX = 45;
export const HOURLY_RATE_DEFAULT = 20;
export const MAX_SLOTS = 5;

export function getMetierById(id: string): Metier | undefined {
  return METIERS.find((m) => m.id === id);
}

export function getMetierLabel(id: string): string {
  return getMetierById(id)?.label ?? id;
}

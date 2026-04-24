import {
  Activity,
  BookOpen,
  Brain,
  Dumbbell,
  GraduationCap,
  HeartHandshake,
  Moon,
  Palette,
  Sparkles,
  Users,
  type LucideIcon,
} from "lucide-react";

export type MetierCategory = "soin_psychique" | "educatif" | "animation";

export interface Metier {
  id: string;
  label: string;
  icon: LucideIcon;
  category: MetierCategory;
}

export const METIERS: Metier[] = [
  // Soin psychique / relationnel
  {
    id: "psychologue",
    label: "Psychologue",
    icon: Brain,
    category: "soin_psychique",
  },
  {
    id: "art-therapeute",
    label: "Art thérapeute",
    icon: Palette,
    category: "soin_psychique",
  },
  {
    id: "psychomotricien",
    label: "Psychomotricien",
    icon: Activity,
    category: "soin_psychique",
  },
  {
    id: "sophrologue",
    label: "Sophrologue",
    icon: Sparkles,
    category: "soin_psychique",
  },
  // Éducatif / accompagnement
  {
    id: "educateur-specialise",
    label: "Éducateur spécialisé",
    icon: BookOpen,
    category: "educatif",
  },
  {
    id: "moniteur-educateur",
    label: "Moniteur éducateur",
    icon: BookOpen,
    category: "educatif",
  },
  {
    id: "surveillant-de-nuit",
    label: "Surveillant de nuit",
    icon: Moon,
    category: "educatif",
  },
  {
    id: "auxiliaire-de-vie",
    label: "Auxiliaire de vie",
    icon: HeartHandshake,
    category: "educatif",
  },
  // Animation / formation
  {
    id: "educateur-sportif",
    label: "Éducateur sportif",
    icon: Dumbbell,
    category: "animation",
  },
  {
    id: "formateur",
    label: "Formateur",
    icon: GraduationCap,
    category: "animation",
  },
  {
    id: "intervenant-bien-etre",
    label: "Intervenant bien-être",
    icon: Sparkles,
    category: "animation",
  },
  {
    id: "autre",
    label: "Autre métier",
    icon: Users,
    category: "animation",
  },
];

export const METIERS_BY_CATEGORY: Record<MetierCategory, Metier[]> = {
  soin_psychique: METIERS.filter((m) => m.category === "soin_psychique"),
  educatif: METIERS.filter((m) => m.category === "educatif"),
  animation: METIERS.filter((m) => m.category === "animation"),
};

export const CATEGORY_LABELS: Record<MetierCategory, string> = {
  soin_psychique: "Soin psychique / relationnel",
  educatif: "Éducatif / accompagnement",
  animation: "Animation / formation",
};

export const HOURLY_RATE_MIN = 15;
export const HOURLY_RATE_MAX = 45;
export const HOURLY_RATE_DEFAULT = 20;
export const MAX_SLOTS = 5;

export function getMetierById(id: string): Metier | undefined {
  return METIERS.find((m) => m.id === id);
}

const LEGACY_METIER_LABELS: Record<string, string> = {
  "aide-soignant": "Aide-soignant(e)",
  AIDE_SOIGNANT: "Aide-soignant(e)",
  infirmier: "Infirmier(ère)",
  INFIRMIER: "Infirmier(ère)",
  "amp-aes": "AMP / AES",
  AMP_AES: "AMP / AES",
  "accompagnant-educatif": "Accompagnant(e) éducatif et social",
  ACCOMPAGNANT_EDUCATIF: "Accompagnant(e) éducatif et social",
  "chef-de-service": "Chef de service",
  CHEF_DE_SERVICE: "Chef de service",
  "maitresse-de-maison": "Maîtresse de maison",
  MAITRESSE_DE_MAISON: "Maîtresse de maison",
  "agent-de-service": "Agent de service",
  AGENT_DE_SERVICE: "Agent de service",
  cuisinier: "Cuisinier(ère)",
  CUISINIER: "Cuisinier(ère)",
  "veilleur-de-nuit": "Veilleur(euse) de nuit",
  VEILLEUR_DE_NUIT: "Veilleur(euse) de nuit",
};

export function getMetierLabel(id: string): string {
  return getMetierById(id)?.label ?? LEGACY_METIER_LABELS[id] ?? id;
}

// ─── SOS Renfort v2 — Dictionnaires ──────────────────────────────────────────

export const TYPES_ETABLISSEMENTS = [
  "EHPAD",
  "MAS",
  "FAM",
  "MECS",
  "IME",
  "Domicile",
  "SSIAD",
  "Foyer de vie",
  "Clinique",
  "Autre",
] as const;

export const PUBLIC_CIBLE_OPTIONS = [
  "Enfants",
  "Adolescents",
  "Adultes",
  "Personnes âgées",
  "Handicap psychique",
  "Handicap moteur",
  "TSA / autisme",
  "Troubles cognitifs",
  "Protection de l'enfance",
  "Addictions",
  "Précarité",
  "Rééducation",
] as const;

export const PERKS_OPTIONS = [
  { id: "MEALS_PROVIDED", label: "Repas fourni sur place" },
  { id: "FREE_PARKING", label: "Parking gratuit" },
  { id: "KM_REIMBURSEMENT", label: "Remboursement frais kilométriques" },
  { id: "ACCOMMODATION", label: "Logement / Chambre de garde" },
  { id: "TRANSPORT_REIMBURSEMENT", label: "Remboursement transport en commun" },
] as const;

export const SKILLS_OPTIONS = [
  "Accompagnement éducatif",
  "Troubles du comportement",
  "Handicap psychique",
  "Handicap moteur",
  "TSA / autisme",
  "Addictions",
  "Protection de l'enfance",
  "Médiation artistique",
  "Médiation corporelle",
  "Animation de groupe",
  "Gestion de crise",
  "Travail de nuit",
  "Transmission équipe",
  "Rééducation",
] as const;

export const TRANSMISSION_TIMES = [
  "5 min",
  "10 min",
  "15 min",
  "20 min",
  "30 min",
] as const;

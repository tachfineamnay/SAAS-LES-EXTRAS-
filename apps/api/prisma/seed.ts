import {
  PrismaClient,
  ReliefMissionStatus,
  ServiceType,
  UserRole,
  UserStatus,
} from "@prisma/client";
import * as bcrypt from "bcryptjs";
import { addDays } from "date-fns";
import { fromZonedTime, toZonedTime } from "date-fns-tz";

const prisma = new PrismaClient();

const PARIS_TIMEZONE = "Europe/Paris";
const DEMO_PASSWORD = "LesExtrasDemo!2026";
const SALT_ROUNDS = 10;

type SeedUser = {
  id: string;
  profileId: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  firstName: string;
  lastName: string;
  jobTitle: string;
  bio: string;
  isAvailable?: boolean;
};

const seedUsers: SeedUser[] = [
  {
    id: "seed-user-admin-demo",
    profileId: "seed-profile-admin-demo",
    email: "admin@lesextras.local",
    role: UserRole.ADMIN,
    status: UserStatus.VERIFIED,
    firstName: "Camille",
    lastName: "Renaud",
    jobTitle: "Super Admin",
    bio: "Pilotage du back-office LesExtras.",
  },
  {
    id: "seed-user-client-demo",
    profileId: "seed-profile-client-demo",
    email: "directeur@mecs-avenir.fr",
    role: UserRole.CLIENT,
    status: UserStatus.VERIFIED,
    firstName: "Laurence",
    lastName: "Ménard",
    jobTitle: "Directrice",
    bio: "Direction de la MECS L'Avenir, coordination des remplacements urgents.",
  },
  {
    id: "seed-user-talent-demo",
    profileId: "seed-profile-talent-demo",
    email: "karim.educ@gmail.com",
    role: UserRole.TALENT,
    status: UserStatus.VERIFIED,
    firstName: "Karim",
    lastName: "Bensalem",
    jobTitle: "Éducateur spécialisé",
    bio: "Interventions en protection de l'enfance et situations de crise.",
    isAvailable: true,
  },
  {
    id: "seed-user-client-chrs",
    profileId: "seed-profile-client-chrs",
    email: "cadre-nuit@chrs-horizon.fr",
    role: UserRole.CLIENT,
    status: UserStatus.PENDING,
    firstName: "Sophie",
    lastName: "Bournet",
    jobTitle: "Cadre de nuit",
    bio: "Gestion des équipes de nuit au CHRS Horizon.",
  },
  {
    id: "seed-user-client-ehpad",
    profileId: "seed-profile-client-ehpad",
    email: "coordination@ehpad-rosiers.fr",
    role: UserRole.CLIENT,
    status: UserStatus.PENDING,
    firstName: "Marc",
    lastName: "Rochat",
    jobTitle: "Coordinateur soins",
    bio: "Pilotage de la continuité des soins en EHPAD.",
  },
  {
    id: "seed-user-client-itep",
    profileId: "seed-profile-client-itep",
    email: "direction@itep-monts.fr",
    role: UserRole.CLIENT,
    status: UserStatus.VERIFIED,
    firstName: "Claire",
    lastName: "Dubois",
    jobTitle: "Directrice ITEP",
    bio: "Organisation des renforts éducatifs de l'ITEP des Monts.",
  },
  {
    id: "seed-user-talent-training",
    profileId: "seed-profile-talent-training",
    email: "amelie.formation@prointervenants.fr",
    role: UserRole.TALENT,
    status: UserStatus.PENDING,
    firstName: "Amélie",
    lastName: "Rodriguez",
    jobTitle: "Formatrice prévention des violences",
    bio: "Formatrice certifiée en gestion de crise et désescalade.",
    isAvailable: true,
  },
  {
    id: "seed-user-talent-cooking",
    profileId: "seed-profile-talent-cooking",
    email: "nina.cuisine@prointervenants.fr",
    role: UserRole.TALENT,
    status: UserStatus.PENDING,
    firstName: "Nina",
    lastName: "Collet",
    jobTitle: "Animatrice cuisine thérapeutique",
    bio: "Ateliers cuisine à visée éducative et thérapeutique.",
    isAvailable: true,
  },
  {
    id: "seed-user-talent-visio",
    profileId: "seed-profile-talent-visio",
    email: "samir.visio@prointervenants.fr",
    role: UserRole.TALENT,
    status: UserStatus.VERIFIED,
    firstName: "Samir",
    lastName: "Haddad",
    jobTitle: "Psychologue clinicien",
    bio: "Conduite de sessions d'analyse de pratique en visioconférence.",
    isAvailable: true,
  },
];

function parisMidnight(referenceUtc = new Date()): Date {
  const parisNow = toZonedTime(referenceUtc, PARIS_TIMEZONE);
  return new Date(parisNow.getFullYear(), parisNow.getMonth(), parisNow.getDate());
}

function parisDateAt(baseParisDay: Date, hour: number, minute: number): Date {
  const localParisDateTime = new Date(
    baseParisDay.getFullYear(),
    baseParisDay.getMonth(),
    baseParisDay.getDate(),
    hour,
    minute,
    0,
    0,
  );
  return fromZonedTime(localParisDateTime, PARIS_TIMEZONE);
}

function getTonightShift(nowUtc = new Date()): { dateStart: Date; dateEnd: Date } {
  let day = parisMidnight(nowUtc);
  let dateStart = parisDateAt(day, 21, 0);

  if (dateStart <= nowUtc) {
    day = addDays(day, 1);
    dateStart = parisDateAt(day, 21, 0);
  }

  const dateEnd = parisDateAt(addDays(day, 1), 7, 0);
  return { dateStart, dateEnd };
}

function getNextWeekendSlot(nowUtc = new Date()): { dateStart: Date; dateEnd: Date } {
  const baseDay = parisMidnight(nowUtc);
  const dayOfWeek = baseDay.getDay(); // 0 sunday - 6 saturday
  let daysUntilSaturday = (6 - dayOfWeek + 7) % 7;

  if (dayOfWeek === 6 || dayOfWeek === 0) {
    daysUntilSaturday = dayOfWeek === 6 ? 7 : 6;
  }

  const saturday = addDays(baseDay, daysUntilSaturday);
  return {
    dateStart: parisDateAt(saturday, 8, 0),
    dateEnd: parisDateAt(saturday, 20, 0),
  };
}

function getNextWeekSlot(nowUtc = new Date()): { dateStart: Date; dateEnd: Date } {
  const baseDay = parisMidnight(nowUtc);
  const mondayBasedDayIndex = (baseDay.getDay() + 6) % 7; // monday = 0
  const daysUntilNextMonday = 7 - mondayBasedDayIndex;
  const nextMonday = addDays(baseDay, daysUntilNextMonday === 0 ? 7 : daysUntilNextMonday);
  const nextWeekTuesday = addDays(nextMonday, 1);

  return {
    dateStart: parisDateAt(nextWeekTuesday, 9, 0),
    dateEnd: parisDateAt(nextWeekTuesday, 18, 0),
  };
}

async function upsertUsersAndProfiles(): Promise<Map<string, string>> {
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, SALT_ROUNDS);
  const userIdByEmail = new Map<string, string>();

  for (const seedUser of seedUsers) {
    const user = await prisma.user.upsert({
      where: { email: seedUser.email },
      update: {
        password: passwordHash,
        role: seedUser.role,
        status: seedUser.status,
        isAvailable: seedUser.isAvailable ?? false,
      },
      create: {
        id: seedUser.id,
        email: seedUser.email,
        password: passwordHash,
        role: seedUser.role,
        status: seedUser.status,
        isAvailable: seedUser.isAvailable ?? false,
      },
      select: {
        id: true,
        email: true,
      },
    });

    await prisma.profile.upsert({
      where: { userId: user.id },
      update: {
        firstName: seedUser.firstName,
        lastName: seedUser.lastName,
        jobTitle: seedUser.jobTitle,
        bio: seedUser.bio,
      },
      create: {
        id: seedUser.profileId,
        userId: user.id,
        firstName: seedUser.firstName,
        lastName: seedUser.lastName,
        jobTitle: seedUser.jobTitle,
        bio: seedUser.bio,
      },
    });

    userIdByEmail.set(user.email, user.id);
  }

  return userIdByEmail;
}

async function upsertReliefMissions(userIdByEmail: Map<string, string>): Promise<void> {
  const tonight = getTonightShift();
  const nextWeekend = getNextWeekendSlot();
  const nextWeek = getNextWeekSlot();

  const missions = [
    {
      id: "seed-mission-veilleur-nuit-urgence",
      title: "Veilleur de nuit - Urgence",
      dateStart: tonight.dateStart,
      dateEnd: tonight.dateEnd,
      hourlyRate: 26,
      address: "MECS Horizon Jeunes, 24 rue des Acacias, 69003 Lyon",
      clientEmail: "cadre-nuit@chrs-horizon.fr",
    },
    {
      id: "seed-mission-aide-soignant-ehpad",
      title: "Aide-Soignant(e) EHPAD",
      dateStart: nextWeekend.dateStart,
      dateEnd: nextWeekend.dateEnd,
      hourlyRate: 24,
      address: "EHPAD Les Rosiers, 8 avenue Paul-Bert, 59491 Villeneuve-d'Ascq",
      clientEmail: "coordination@ehpad-rosiers.fr",
    },
    {
      id: "seed-mission-educateur-renfort-itep",
      title: "Éducateur Spécialisé - Renfort ITEP",
      dateStart: nextWeek.dateStart,
      dateEnd: nextWeek.dateEnd,
      hourlyRate: 30,
      address: "ITEP des Monts, 12 chemin de la Source, 31100 Toulouse",
      clientEmail: "direction@itep-monts.fr",
    },
  ];

  for (const mission of missions) {
    const clientId = userIdByEmail.get(mission.clientEmail);
    if (!clientId) {
      throw new Error(`Client introuvable pour la mission ${mission.id}`);
    }

    await prisma.reliefMission.upsert({
      where: { id: mission.id },
      update: {
        title: mission.title,
        dateStart: mission.dateStart,
        dateEnd: mission.dateEnd,
        hourlyRate: mission.hourlyRate,
        address: mission.address,
        clientId,
        status: ReliefMissionStatus.OPEN,
      },
      create: {
        id: mission.id,
        title: mission.title,
        dateStart: mission.dateStart,
        dateEnd: mission.dateEnd,
        hourlyRate: mission.hourlyRate,
        address: mission.address,
        clientId,
        status: ReliefMissionStatus.OPEN,
      },
    });
  }
}

async function upsertServices(userIdByEmail: Map<string, string>): Promise<void> {
  const services = [
    {
      id: "seed-service-gestion-violence",
      title: "Formation Gestion de la Violence (Non-Violent Crisis Intervention)",
      description:
        "Formation intensive sur la prévention de l'escalade, la désescalade verbale et la sécurisation d'équipe.",
      price: 490,
      type: ServiceType.TRAINING,
      capacity: 12,
      ownerEmail: "amelie.formation@prointervenants.fr",
    },
    {
      id: "seed-service-cuisine-therapeutique",
      title: "Atelier Cuisine Thérapeutique",
      description:
        "Atelier pratique favorisant autonomie, régulation émotionnelle et cohésion de groupe via la cuisine.",
      price: 280,
      type: ServiceType.WORKSHOP,
      capacity: 8,
      ownerEmail: "nina.cuisine@prointervenants.fr",
    },
    {
      id: "seed-service-analyse-pratique-visio",
      title: "Session Analyse de Pratique (Visio)",
      description:
        "Supervision collective en visio pour analyser les situations complexes et ajuster les postures pro.",
      price: 220,
      type: ServiceType.TRAINING,
      capacity: 10,
      ownerEmail: "samir.visio@prointervenants.fr",
    },
  ];

  for (const service of services) {
    const ownerId = userIdByEmail.get(service.ownerEmail);
    if (!ownerId) {
      throw new Error(`Talent introuvable pour le service ${service.id}`);
    }

    await prisma.service.upsert({
      where: { id: service.id },
      update: {
        title: service.title,
        description: service.description,
        price: service.price,
        type: service.type,
        capacity: service.capacity,
        ownerId,
      },
      create: {
        id: service.id,
        title: service.title,
        description: service.description,
        price: service.price,
        type: service.type,
        capacity: service.capacity,
        ownerId,
      },
    });
  }
}

export async function main(): Promise<void> {
  console.log("Seeding LesExtras demo data...");
  console.log(`Timezone seed: ${PARIS_TIMEZONE}`);

  const userIdByEmail = await upsertUsersAndProfiles();
  console.log(`Seed users done (${userIdByEmail.size} users)`);

  await upsertReliefMissions(userIdByEmail);
  await upsertServices(userIdByEmail);

  console.log("Seed missions/services done");
  console.log("Demo credentials:");
  console.log("  email: admin@lesextras.local        | password: LesExtrasDemo!2026");
  console.log("  email: directeur@mecs-avenir.fr | password: LesExtrasDemo!2026");
  console.log("  email: karim.educ@gmail.com     | password: LesExtrasDemo!2026");
  console.log("Seed completed successfully.");
}

void main()
  .catch((error: unknown) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

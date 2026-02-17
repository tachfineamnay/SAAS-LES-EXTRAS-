export type AdminStatsData = {
  gmv: number;
  activeMissionsToday: number;
  newUsersLast7Days: number;
  newUsersTrendLabel: string;
  sosConversionRate: number;
};

export type PendingValidationUser = {
  id: string;
  name: string;
  email: string;
  submittedAt: string;
  status: "PENDING";
};

export type BlockedBookingItem = {
  id: string;
  label: string;
  reason: string;
  status: "BLOCKED" | "DISPUTE";
};

export type AdminDeskData = {
  stats: AdminStatsData;
  pendingUsers: PendingValidationUser[];
  blockedBookings: BlockedBookingItem[];
};

export const adminDeskMockData: AdminDeskData = {
  stats: {
    gmv: 12450,
    activeMissionsToday: 18,
    newUsersLast7Days: 42,
    newUsersTrendLabel: "+12%",
    sosConversionRate: 78,
  },
  pendingUsers: [
    {
      id: "pending-user-1",
      name: "Nina Bernard",
      email: "nina.bernard@exemple.fr",
      submittedAt: "Aujourd'hui, 09:24",
      status: "PENDING",
    },
    {
      id: "pending-user-2",
      name: "Karim Ait-Belkacem",
      email: "karim.ait@exemple.fr",
      submittedAt: "Aujourd'hui, 08:12",
      status: "PENDING",
    },
    {
      id: "pending-user-3",
      name: "Emma Laurent",
      email: "emma.laurent@exemple.fr",
      submittedAt: "Hier, 18:03",
      status: "PENDING",
    },
    {
      id: "pending-user-4",
      name: "MECS Les Acacias",
      email: "direction@acacias-mecs.fr",
      submittedAt: "Hier, 15:41",
      status: "PENDING",
    },
    {
      id: "pending-user-5",
      name: "Lucas Morel",
      email: "lucas.morel@exemple.fr",
      submittedAt: "Hier, 11:26",
      status: "PENDING",
    },
  ],
  blockedBookings: [],
};

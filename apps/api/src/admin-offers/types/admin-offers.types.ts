import { ReliefMissionStatus } from "@prisma/client";

export type AdminMissionRow = {
  id: string;
  title: string;
  address: string;
  status: ReliefMissionStatus;
  createdAt: string;
  dateStart: string;
  dateEnd: string;
  hourlyRate: number;
  establishmentName: string;
  establishmentEmail: string;
  candidatesCount: number;
};

export type AdminServiceRow = {
  id: string;
  title: string;
  description: string | null;
  price: number;
  createdAt: string;
  freelanceName: string;
  freelanceEmail: string;
};

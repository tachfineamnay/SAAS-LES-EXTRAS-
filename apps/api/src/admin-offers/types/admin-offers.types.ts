import { ReliefMissionStatus, ServiceType } from "@prisma/client";

export type AdminMissionRow = {
  id: string;
  title: string;
  address: string;
  status: ReliefMissionStatus;
  createdAt: string;
  dateStart: string;
  dateEnd: string;
  hourlyRate: number;
  clientName: string;
  clientEmail: string;
  candidatesCount: number;
};

export type AdminServiceRow = {
  id: string;
  title: string;
  description: string | null;
  price: number;
  type: ServiceType;
  isFeatured: boolean;
  isHidden: boolean;
  createdAt: string;
  talentName: string;
  talentEmail: string;
};

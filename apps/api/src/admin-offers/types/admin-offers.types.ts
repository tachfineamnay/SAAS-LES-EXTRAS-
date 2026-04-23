import {
  DeskRequestPriority,
  DeskRequestStatus,
  ReliefMissionStatus,
  ServiceType,
} from "@prisma/client";

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
  type: ServiceType;
  isFeatured: boolean;
  isHidden: boolean;
  createdAt: string;
  freelanceName: string;
  freelanceEmail: string;
};

export type AdminMissionLinkedDeskRequest = {
  id: string;
  status: DeskRequestStatus;
  priority: DeskRequestPriority;
  createdAt: string;
  messageExcerpt: string;
};

export type AdminMissionDetail = {
  id: string;
  title: string;
  status: ReliefMissionStatus;
  establishmentName: string;
  establishmentEmail: string;
  address: string;
  dateStart: string;
  dateEnd: string;
  hourlyRate: number;
  candidatesCount: number;
  linkedDeskRequests: AdminMissionLinkedDeskRequest[];
};

export type AdminServiceDetail = {
  id: string;
  title: string;
  type: ServiceType;
  price: number;
  freelanceName: string;
  freelanceEmail: string;
  isFeatured: boolean;
  isHidden: boolean;
  description: string | null;
  createdAt: string;
};

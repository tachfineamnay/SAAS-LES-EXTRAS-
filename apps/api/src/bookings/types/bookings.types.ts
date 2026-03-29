export type BookingLineType = "MISSION" | "SERVICE_BOOKING" | "BOOKING";

export type BookingLineStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PAID"
  | "CANCELLED"
  | "ASSIGNED"
  | "COMPLETED";

export type BookingLine = {
  lineId: string;
  lineType: BookingLineType;
  date: string;
  typeLabel: "Mission SOS" | "Atelier";
  interlocutor: string;
  status: BookingLineStatus;
  address: string;
  contactEmail: string;
  relatedBookingId?: string;
};

export type BookingsPageData = {
  lines: BookingLine[];
  nextStep: BookingLine | null;
};

export type BookingDetails = {
  address: string;
  contactEmail: string;
  contactPhone?: string;
  contactName?: string;
  missionTitle?: string;
  dateStart?: string;
  dateEnd?: string;
  shift?: string;
  hourlyRate?: number;
  accessInstructions?: string;
  hasTransmissions?: boolean;
  transmissionTime?: string;
  perks?: string[];
  freelanceAcknowledged?: boolean;
};

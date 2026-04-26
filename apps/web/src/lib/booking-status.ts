import type { BookingLineStatus } from "@/app/actions/bookings";

export type BookingStatusVariant =
    | "amber"
    | "teal"
    | "emerald"
    | "red"
    | "info"
    | "outline"
    | "quiet";

const BOOKING_STATUS_LABELS: Record<BookingLineStatus, string> = {
    PENDING: "En attente",
    QUOTE_SENT: "Devis envoyé",
    QUOTE_ACCEPTED: "Devis accepté",
    CONFIRMED: "Confirmé",
    ASSIGNED: "Assigné",
    IN_PROGRESS: "En cours",
    COMPLETED: "Terminé",
    COMPLETED_AWAITING_PAYMENT: "Paiement en attente",
    AWAITING_PAYMENT: "Paiement en attente",
    PAID: "Payé",
    CANCELLED: "Annulé",
};

const BOOKING_STATUS_VARIANTS: Record<BookingLineStatus, BookingStatusVariant> = {
    PENDING: "amber",
    QUOTE_SENT: "info",
    QUOTE_ACCEPTED: "teal",
    CONFIRMED: "teal",
    ASSIGNED: "info",
    IN_PROGRESS: "info",
    COMPLETED: "outline",
    COMPLETED_AWAITING_PAYMENT: "amber",
    AWAITING_PAYMENT: "amber",
    PAID: "emerald",
    CANCELLED: "red",
};

const CANCELLABLE_STATUSES = new Set<BookingLineStatus>([
    "PENDING",
    "QUOTE_SENT",
    "QUOTE_ACCEPTED",
    "CONFIRMED",
    "ASSIGNED",
]);

const ACTIVE_STATUSES = new Set<BookingLineStatus>([
    "QUOTE_ACCEPTED",
    "CONFIRMED",
    "ASSIGNED",
    "IN_PROGRESS",
]);

function isKnownBookingStatus(status: string): status is BookingLineStatus {
    return status in BOOKING_STATUS_LABELS;
}

export function getBookingStatusLabel(status: BookingLineStatus | string): string {
    return isKnownBookingStatus(status) ? BOOKING_STATUS_LABELS[status] : status;
}

export function getBookingStatusVariant(status: BookingLineStatus | string): BookingStatusVariant {
    return isKnownBookingStatus(status) ? BOOKING_STATUS_VARIANTS[status] : "outline";
}

export function isBookingCancellable(status: BookingLineStatus | string): boolean {
    return isKnownBookingStatus(status) && CANCELLABLE_STATUSES.has(status);
}

export function isBookingActive(status: BookingLineStatus | string): boolean {
    return isKnownBookingStatus(status) && ACTIVE_STATUSES.has(status);
}

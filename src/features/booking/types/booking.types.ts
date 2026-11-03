


export type GuestInput = {
    fullName: string;
    phone: string;
    email?: string
}

export type BookingInput = {
    checkIn: string;
    checkOut: string;
    guestCount: number;
    notes?: string;
}

export type CreateBookingInput = {
    guest: GuestInput;
    booking: BookingInput
}


export type BookingCreated = {
    bookingId: string;
    trackingReference: string;
    status: string;
    checkIn: string;
    checkOut: string;
    nights: number;
    guestCounts: number;
    pricing: {
        nightlyRate: number | string;
        totalAmount: number;
        requiredDownpayment: number;
        currency: string;
    };
    expiresAt: string;
    guest: {
        fullName: string;
        email: string | null;
        phone: string;
    };
}

export type BookingResponse = {
    bookings: BookingCreated;
    message: string;
}

export type BookingPaymentDetails = {
    bookingId: string;
    trackingReference: string;
    status: string;
    checkIn: string;
    checkOut: string;
    totalAmount: number;
    downpaymentAmount: number;
    cancellationReason: string | null;
    expiresAt: string | null;
    canUploadProof: boolean;
    paymentSubmitted: boolean;
    paymentVerified: boolean;
}

export type BookingPaymentDetailsResponse = {
    message: string;
    booking: BookingPaymentDetails;
}

export type PaymentProofResponse = {
    message: string;
}

export type PublicBookingStatus = {
    id: string;
    checkIn: string;
    checkOut: string;
    status: "pending" | "approved" | "rejected" | "cancelled" | "expired";
    guestName: string;
    paymentStatus: "not_submitted" | "pending_verification" | "verified";
};

export type PublicBookingStatusResponse = {
    message: string;
    booking: PublicBookingStatus;
};




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
    payment: {
        id: string;
        bookingId: string;
        type: string;
        amount: number | string;
        proofFileKey: string | null;
        verified: boolean;
        createdAt: string;
    };
    booking: {
        id: string;
        status: string;
        totalAmount: number | string;
    };
}

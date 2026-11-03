import type {
  BookingPaymentDetailsResponse,
  BookingResponse,
  CreateBookingInput,
  PaymentProofResponse,
} from "@/features/booking/types/booking.types";
import type { CalendarResponse } from "@/features/booking/types/calendar.types";
import { api } from "@/lib/axios";

export const bookingService = {
  getCalendar: async (month: string, propertyId = 1) => {
    const response = await api.get<CalendarResponse>("/calendars", {
      params: { month, propertyId },
    });
    return response.data.calendars;
  },

  createBooking: async (input: CreateBookingInput) => {
    const response = await api.post<BookingResponse>("/bookings", input);
    return response.data;
  },

  getBookingPaymentDetails: async (bookingId: string) => {
    const response = await api.get<BookingPaymentDetailsResponse>(
      `/bookings/${encodeURIComponent(bookingId)}`,
    );
    return response.data.booking;
  },

  uploadPaymentProof: async (bookingId: string, file: File) => {
    const formData = new FormData();

    formData.append("proof", file);
    const response = await api.post<PaymentProofResponse>(
      `/bookings/${encodeURIComponent(bookingId)}/payment-proof`,
      formData,
    );
    return response.data;
  },
};

import { bookingService } from "@/service/booking";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  BookingPaymentDetails,
  CreateBookingInput,
} from "../types/booking.types";

export const useGetCalendar = (month: string, propertyId = 1) => {
  return useQuery({
    queryKey: ["calendar", propertyId, month],
    queryFn: () => bookingService.getCalendar(month, propertyId),
  });
};

export const useCreateBooking = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateBookingInput) => bookingService.createBooking(input),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ["calendar"],
      })
  });
};

export const useGetBookingPaymentDetails = (bookingId: string) =>
  useQuery({
    queryKey: ["booking-payment", bookingId],
    queryFn: () => bookingService.getBookingPaymentDetails(bookingId),
    enabled: Boolean(bookingId),
    retry: false,
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
  });

export const useUploadPaymentProof = (bookingId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: File) =>
      bookingService.uploadPaymentProof(bookingId, file),
    onSuccess: async () => {
      queryClient.setQueryData<BookingPaymentDetails>(
        ["booking-payment", bookingId],
        (current) =>
          current ? { ...current, paymentSubmitted: true } : current,
      );
      await queryClient.invalidateQueries({
        queryKey: ["booking-payment", bookingId],
      });
    },
  });
};

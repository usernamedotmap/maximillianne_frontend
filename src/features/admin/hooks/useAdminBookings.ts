import { useQuery } from "@tanstack/react-query";
import {
  adminBookingService,
  type AdminBookingStatus,
} from "@/service/admin-booking";

export const useAdminBookings = (
  status: AdminBookingStatus,
  page: number,
  pageSize: number,
) =>
  useQuery({
    queryKey: ["admin", "bookings", status, page, pageSize],
    queryFn: () => adminBookingService.getBookingsByStatus(status, page, pageSize),
  });

export const useAdminPendingBookings = (page: number, pageSize: number) =>
  useAdminBookings("pending", page, pageSize);

export const useAdminDashboardSummary = () =>
  useQuery({
    queryKey: ["admin", "dashboard-summary"],
    queryFn: adminBookingService.getDashboardSummary,
  });

export const useAdminBooking = (bookingId: string) =>
  useQuery({
    queryKey: ["admin", "booking", bookingId],
    queryFn: () => adminBookingService.getBooking(bookingId),
    enabled: Boolean(bookingId),
  });

import { api } from "@/lib/axios";

export type AdminBookingStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "cancelled"
  | "expired";

export type AdminBookingListItem = {
  id: string;
  checkIn: string;
  checkOut: string;
  guestCount: number;
  status: AdminBookingStatus;
  totalAmount: number | string;
  createdAt: string;
  guest: {
    fullName: string;
    phone: string;
  };
  payment: {
    id: string;
    type: string;
    amount: number | string;
    proofFileKey: string | null;
    verified: boolean;
    createdAt: string;
    verifiedAt: string | null;
  }[];
};

export type AdminBookingDetails = Omit<AdminBookingListItem, "guest" | "payment"> & {
  nightlyRate: number | string;
  expiresAt: string | null;
  notes: string | null;
  cancellationReason: string | null;
  cancelledAt: string | null;
  guest: {
    fullName: string;
    phone: string;
    email: string | null;
  };
  payment: AdminBookingListItem["payment"];
};

export type AdminBookingListResponse = {
  message: string;
  bookings: AdminBookingListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPage: number;
  };
};

export type AdminDashboardSummary = {
  pendingRequests: number;
  upcomingBookings: number;
  monthlyGrossRevenue: number;
  revenueMonth: string;
};

export type AdminDashboardSummaryResponse = {
  message: string;
  summary: AdminDashboardSummary;
};

export type AdminBlockedDate = {
  id: string;
  startDate: string;
  endDate: string;
  reason: string | null;
  createdAt: string;
};

export type AdminBlockedDatesResponse = {
  message: string;
  blockedDates: AdminBlockedDate[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPage: number;
  };
};

export type AdminBookingDetailsResponse = {
  message: string;
  bookings: AdminBookingDetails;
};

export type PaymentProofUrlResponse = {
  message: string;
  payment: {
    url: string;
    paymentId: string;
    expiresInSeconds: number;
  };
};

export const adminBookingService = {
  getDashboardSummary: async () => {
    const response = await api.get<AdminDashboardSummaryResponse>(
      "/admin/bookings/summary",
    );
    return response.data.summary;
  },

  getBookingsByStatus: async (
    status: AdminBookingStatus,
    page: number,
    limit: number,
  ) => {
    const response = await api.get<AdminBookingListResponse>("/admin/bookings", {
      params: { status, page, limit },
    });
    return response.data;
  },

  getBlockedDates: async (page: number, limit = 100) => {
    const response = await api.get<AdminBlockedDatesResponse>(
      "/admin/bookings/blocked-dates",
      { params: { page, limit } },
    );
    return response.data;
  },

  getAllBlockedDates: async () => {
    const firstPage = await adminBookingService.getBlockedDates(1);
    const blockedDates = [...firstPage.blockedDates];

    for (let page = 2; page <= firstPage.pagination.totalPage; page += 1) {
      const response = await adminBookingService.getBlockedDates(page);
      blockedDates.push(...response.blockedDates);
    }

    return blockedDates;
  },

  createBlockedDates: async (input: {
    startDate: string;
    endDate: string;
    reason?: string;
  }) => {
    await api.post("/admin/bookings/blocked-dates", input);
  },

  deleteBlockedDate: async (blockedDateId: string) => {
    await api.delete(
      `/admin/bookings/blocked-dates/${encodeURIComponent(blockedDateId)}`,
    );
  },

  getBooking: async (bookingId: string) => {
    const response = await api.get<AdminBookingDetailsResponse>(
      `/admin/bookings/${encodeURIComponent(bookingId)}`,
    );
    return response.data.bookings;
  },

  getPaymentProofUrl: async (paymentId: string) => {
    const response = await api.get<PaymentProofUrlResponse>(
      `/admin/payments/${encodeURIComponent(paymentId)}/proof-url`,
    );
    return response.data.payment;
  },

  verifyPayment: async (paymentId: string) => {
    await api.patch(`/admin/payments/${encodeURIComponent(paymentId)}/verify`);
  },

  approveBooking: async (bookingId: string) => {
    await api.patch(`/admin/bookings/${encodeURIComponent(bookingId)}/approved`);
  },

  rejectBooking: async (bookingId: string) => {
    await api.patch(`/admin/bookings/${encodeURIComponent(bookingId)}/reject`);
  },

  cancelBooking: async (bookingId: string, reason?: string) => {
    await api.patch(`/admin/bookings/${encodeURIComponent(bookingId)}/cancel`, {
      ...(reason ? { reason } : {}),
    });
  },
};

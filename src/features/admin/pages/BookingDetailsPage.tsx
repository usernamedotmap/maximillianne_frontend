import { useState } from "react";
import { useMutation, useQueryClient, useQueries } from "@tanstack/react-query";
import {
  AlertTriangle,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
  ImageOff,
  User,
  X,
  XCircle,
  ZoomIn,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatGuestName } from "@/lib/utils";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/components/ui/toaster";
import { adminBookingService } from "@/service/admin-booking";
import { useAdminBooking } from "../hooks/useAdminBookings";
import type { AdminBookingDetails } from "@/service/admin-booking";

type ConfirmAction = "approve" | "reject" | "cancel";

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("en-PH", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value.slice(0, 10)}T00:00:00.000Z`));

const formatDateTime = (value: string) =>
  new Intl.DateTimeFormat("en-PH", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));

const countNights = (checkIn: string, checkOut: string) => {
  const toUtcDay = (value: string) => {
    const [year, month, day] = value.slice(0, 10).split("-").map(Number);
    return Date.UTC(year, month - 1, day);
  };

  return Math.round((toUtcDay(checkOut) - toUtcDay(checkIn)) / 86_400_000);
};

const formatAmount = (value: number | string) =>
  `₱${Number(value).toLocaleString("en-PH")}`;

const getStatusLabel = (status: string) =>
  status.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());

const getVerifiedAmount = (booking: AdminBookingDetails) =>
  booking.payment
    .filter((payment) => payment.verified)
    .reduce((total, payment) => total + Number(payment.amount), 0);

const BookingDetailsPage = () => {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const queryClient = useQueryClient();
  const [dialogAction, setDialogAction] = useState<ConfirmAction | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [expandedProofUrl, setExpandedProofUrl] = useState<string | null>(null);
  const [isBookingActionPending, setIsBookingActionPending] = useState(false);
  const {
    data: booking,
    isPending,
    isError,
    error,
    refetch,
  } = useAdminBooking(id);

  const paymentsWithProof = booking?.payment.filter(
    (payment) => Boolean(payment.proofFileKey),
  ) ?? [];

  const proofQueries = useQueries({
    queries: paymentsWithProof.map((payment) => ({
      queryKey: ["admin", "payment-proof", payment.id],
      queryFn: () => adminBookingService.getPaymentProofUrl(payment.id),
      staleTime: 10 * 60 * 1000,
      retry: false,
    })),
  });

  const invalidateBookingData = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["admin", "booking", id] }),
      queryClient.invalidateQueries({ queryKey: ["admin", "bookings"] }),
      queryClient.invalidateQueries({ queryKey: ["admin", "dashboard-summary"] }),
    ]);
  };

  const verifyPaymentMutation = useMutation({
    mutationFn: adminBookingService.verifyPayment,
    onSuccess: async () => {
      await invalidateBookingData();
      toast({
        title: "Payment verified",
        description: "The verified payment is now included in the booking total.",
        variant: "success",
      });
    },
    onError: (mutationError) => {
      toast({
        title: "Unable to verify payment",
        description: mutationError instanceof Error
          ? mutationError.message
          : "Please try again.",
        variant: "error",
      });
    },
  });

  const completeBookingAction = async (
    action: "approve" | "reject" | "cancel",
  ) => {
    setIsBookingActionPending(true);
    try {
      if (action === "approve") {
        await adminBookingService.approveBooking(id);
      } else if (action === "reject") {
        await adminBookingService.rejectBooking(id);
      } else {
        await adminBookingService.cancelBooking(id, cancelReason.trim() || undefined);
      }

      await invalidateBookingData();
      toast({
        title: action === "approve"
          ? "Booking approved"
          : action === "reject"
            ? "Booking rejected"
            : "Booking cancelled",
        description: "The booking status has been updated.",
        variant: "success",
      });
      setDialogAction(null);
      setCancelReason("");
      navigate("/admin/dashboard");
    } catch (actionError) {
      toast({
        title: action === "approve"
          ? "Unable to approve booking"
          : action === "reject"
            ? "Unable to reject booking"
            : "Unable to cancel booking",
        description: actionError instanceof Error
          ? actionError.message
          : "Please try again.",
        variant: "error",
      });
    } finally {
      setIsBookingActionPending(false);
    }
  };

  const isPendingBooking = booking?.status === "pending";
  const isCancellable = booking?.status === "pending" || booking?.status === "approved";
  const requiredDownpayment = booking
    ? Math.round(Number(booking.totalAmount) * 0.5)
    : 0;
  const verifiedAmount = booking ? getVerifiedAmount(booking) : 0;
  const hasRequiredVerifiedPayment = verifiedAmount >= requiredDownpayment;
  const isSavingAction =
    verifyPaymentMutation.isPending || isBookingActionPending;

  if (isPending) {
    return (
      <div className="flex min-h-64 items-center justify-center gap-2">
        <Spinner />
        <span className="text-sm text-muted-foreground">Loading booking details...</span>
      </div>
    );
  }

  if (isError || !booking) {
    return (
      <div className="mx-auto max-w-4xl space-y-4">
        <Button variant="outline" onClick={() => navigate("/admin/dashboard")}>
          <ArrowLeft className="size-4" />
          Back to dashboard
        </Button>
        <div className="rounded-xl border border-destructive/30 bg-card p-6">
          <p role="alert" className="text-sm text-destructive">
            {error instanceof Error
              ? error.message
              : "Booking details could not be loaded."}
          </p>
          <Button className="mt-4" variant="outline" onClick={() => refetch()}>
            Try again
          </Button>
        </div>
      </div>
    );
  }

  const formatPaymentStatus = (verified: boolean) => verified ? "Verified" : "Needs verification";
  const guestName = formatGuestName(booking.guest.fullName);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-col justify-between gap-4 border-b border-border pb-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon-sm"
            aria-label="Back to dashboard"
            onClick={() => navigate("/admin/dashboard")}
          >
            <ArrowLeft className="size-4" />
          </Button>
          <div>
            <h1 className="flex flex-wrap items-center gap-2 font-serif text-xl font-bold text-foreground sm:text-2xl">
              Booking Request
              <span className="font-sans text-sm font-medium text-muted-foreground">
                #{booking.id.slice(0, 8).toUpperCase()}
              </span>
            </h1>
            <p className="text-xs text-muted-foreground">
              Submitted {formatDateTime(booking.createdAt)}
            </p>
          </div>
        </div>
        <Badge  variant="outline">{getStatusLabel(booking.status)}</Badge>
      </div>

      <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-12">
        <div className="space-y-6 md:col-span-7">
          <section className="space-y-4 rounded-xl border border-border bg-card p-5 shadow-xs sm:p-6">
            <h2 className="flex items-center gap-2 border-b border-border pb-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              <User className="size-4 text-primary" />
              Guest Information
            </h2>
            <dl className="space-y-3 text-xs sm:text-sm">
              <div className="flex justify-between gap-4 border-b border-border/50 py-1">
                <dt className="text-muted-foreground">Guest name</dt>
                <dd className="text-right font-semibold text-foreground">
                  {guestName}
                </dd>
              </div>
              <div className="flex justify-between gap-4 border-b border-border/50 py-1">
                <dt className="text-muted-foreground">Phone number</dt>
                <dd className="text-right font-mono font-medium text-foreground">
                  {booking.guest.phone}
                </dd>
              </div>
              <div className="flex justify-between gap-4 py-1">
                <dt className="text-muted-foreground">Email address</dt>
                <dd className="break-all text-right font-medium text-foreground">
                  {booking.guest.email || "Not provided"}
                </dd>
              </div>
            </dl>
          </section>

          <section className="space-y-4 rounded-xl border border-border bg-card p-5 shadow-xs sm:p-6">
            <h2 className="flex items-center gap-2 border-b border-border pb-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              <Calendar className="size-4 text-primary" />
              Stay Details
            </h2>
            <dl className="space-y-3 text-xs sm:text-sm">
              <div className="flex justify-between gap-4 border-b border-border/50 py-1">
                <dt className="text-muted-foreground">Check-in</dt>
                <dd className="text-right font-semibold text-foreground">
                  {formatDate(booking.checkIn)} (from 2:00 PM)
                </dd>
              </div>
              <div className="flex justify-between gap-4 border-b border-border/50 py-1">
                <dt className="text-muted-foreground">Check-out</dt>
                <dd className="text-right font-semibold text-foreground">
                  {formatDate(booking.checkOut)} (before 12:00 PM)
                </dd>
              </div>
              <div className="flex justify-between gap-4 border-b border-border/50 py-1">
                <dt className="text-muted-foreground">Duration</dt>
                <dd className="font-semibold text-foreground">
                  {countNights(booking.checkIn, booking.checkOut)} nights
                </dd>
              </div>
              <div className="flex justify-between gap-4 border-b border-border/50 py-1">
                <dt className="text-muted-foreground">Number of guests</dt>
                <dd className="font-semibold text-foreground">{booking.guestCount}</dd>
              </div>
              {booking.notes && (
                <div className="pt-2">
                  <dt className="mb-1 text-xs text-muted-foreground">Guest notes</dt>
                  <dd className="rounded-lg border border-border/50 bg-muted/50 p-3 text-xs text-foreground">
                    {booking.notes}
                  </dd>
                </div>
              )}
              {booking.cancellationReason && (
                <div className="pt-2">
                  <dt className="mb-1 text-xs text-muted-foreground">Cancellation reason</dt>
                  <dd className="rounded-lg border border-border/50 bg-muted/50 p-3 text-xs text-foreground">
                    {booking.cancellationReason}
                  </dd>
                </div>
              )}
            </dl>
          </section>
        </div>

        <div className="space-y-6 md:col-span-5">
          <section className="space-y-4 rounded-xl border border-border bg-card p-5 shadow-xs sm:p-6">
            <h2 className="flex items-center gap-2 border-b border-border pb-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              <FileText className="size-4 text-primary" />
              Payment & Verification
            </h2>
            <dl className="space-y-3 text-xs sm:text-sm">
              <div className="flex justify-between gap-4 border-b border-border/50 py-1">
                <dt className="text-muted-foreground">Nightly rate</dt>
                <dd className="font-medium text-foreground">{formatAmount(booking.nightlyRate)}</dd>
              </div>
              <div className="flex justify-between gap-4 border-b border-border/50 py-1">
                <dt className="text-muted-foreground">Total stay amount</dt>
                <dd className="font-bold text-foreground">{formatAmount(booking.totalAmount)}</dd>
              </div>
              <div className="flex justify-between gap-4 border-b border-border/50 py-1 font-semibold text-primary">
                <dt>Required downpayment (50%)</dt>
                <dd>{formatAmount(requiredDownpayment)}</dd>
              </div>
              <div className="flex justify-between gap-4 py-1">
                <dt className="text-muted-foreground">Verified payments</dt>
                <dd className="font-semibold text-foreground">{formatAmount(verifiedAmount)}</dd>
              </div>
              <div className="flex justify-between gap-4 py-1">
                <dt className="text-muted-foreground">Remaining balance</dt>
                <dd className="font-semibold text-foreground">
                  {formatAmount(Math.max(0, Number(booking.totalAmount) - verifiedAmount))}
                </dd>
              </div>
              {booking.expiresAt && booking.status === "pending" && (
                <div className="flex items-center justify-between gap-4 border-t border-border/50 pt-3">
                  <dt className="flex items-center gap-1.5 text-muted-foreground">
                    <Clock className="size-3.5" />
                    Hold expires
                  </dt>
                  <dd className="text-right font-medium text-foreground">
                    {formatDateTime(booking.expiresAt)}
                  </dd>
                </div>
              )}
            </dl>

            <div className="space-y-3 border-t border-border pt-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                GCash payment proof
              </h3>
              {booking.payment.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
                  No payment records have been submitted.
                </div>
              ) : (
                booking.payment.map((payment) => {
                  const proofIndex = paymentsWithProof.findIndex(
                    (item) => item.id === payment.id,
                  );
                  const proofQuery = proofIndex >= 0 ? proofQueries[proofIndex] : undefined;
                  const proofUrl = proofQuery?.data?.url;

                  return (
                    <div key={payment.id} className="space-y-3 rounded-lg border border-border p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs font-semibold capitalize text-foreground">
                            {payment.type.replaceAll("_", " ")} · {formatAmount(payment.amount)}
                          </p>
                          <p className="mt-1 text-[11px] text-muted-foreground">
                            Submitted {formatDateTime(payment.createdAt)}
                          </p>
                        </div>
                        <Badge variant="outline">
                          {formatPaymentStatus(payment.verified)}
                        </Badge>
                      </div>
                      {proofQuery?.isPending && (
                        <div className="flex items-center justify-center gap-2 rounded-lg bg-muted/40 p-6 text-xs text-muted-foreground">
                          <Spinner />
                          Loading payment screenshot...
                        </div>
                      )}
                      {proofQuery?.isError && (
                        <div role="alert" className="rounded-lg bg-destructive/5 p-3 text-xs text-destructive">
                          Unable to load the payment screenshot.
                        </div>
                      )}
                      {proofUrl && (
                        <button
                          type="button"
                          className="group relative block w-full overflow-hidden rounded-lg border border-border bg-muted/30"
                          onClick={() => setExpandedProofUrl(proofUrl)}
                          aria-label="View payment proof full size"
                        >
                          <img
                            src={proofUrl}
                            alt={`${payment.type.replaceAll("_", " ")} GCash payment proof`}
                            className="max-h-80 w-full object-contain"
                          />
                          <span className="absolute inset-0 flex items-center justify-center bg-black/40 text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                            <span className="flex items-center gap-1.5 rounded-full bg-black/70 px-3 py-1.5 text-xs font-medium">
                              <ZoomIn className="size-4" />
                              View full size
                            </span>
                          </span>
                        </button>
                      )}
                      {payment.proofFileKey && !proofQuery?.isPending && !proofQuery?.isError && !proofUrl && (
                        <div className="flex items-center gap-2 rounded-lg bg-muted/40 p-4 text-xs text-muted-foreground">
                          <ImageOff className="size-4" />
                          No screenshot is available for this payment.
                        </div>
                      )}
                      {!payment.proofFileKey && (
                        <div className="rounded-lg border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
                          No screenshot uploaded for this payment.
                        </div>
                      )}
                      {isPendingBooking && payment.proofFileKey && !payment.verified && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          disabled={verifyPaymentMutation.isPending}
                          onClick={() => verifyPaymentMutation.mutate(payment.id)}
                        >
                          {verifyPaymentMutation.isPending ? "Verifying..." : "Verify payment"}
                        </Button>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </section>

          {isPendingBooking && (
            <section className="space-y-3 rounded-xl border border-border bg-card p-5 shadow-xs">
              <Button
                className="w-full bg-emerald-600 text-white hover:bg-emerald-700"
                disabled={!hasRequiredVerifiedPayment || isSavingAction}
                onClick={() => setDialogAction("approve")}
              >
                <CheckCircle2 className="size-4" />
                Approve booking
              </Button>
              {!hasRequiredVerifiedPayment && (
                <p className="text-center text-xs text-muted-foreground">
                  Verify at least {formatAmount(requiredDownpayment)} in payments to approve.
                </p>
              )}
              <Button
                variant="outline"
                className="w-full border-destructive/30 text-destructive hover:bg-destructive/10"
                disabled={isSavingAction}
                onClick={() => setDialogAction("reject")}
              >
                <XCircle className="size-4" />
                Reject request
              </Button>
            </section>
          )}

          {isCancellable && (
            <Button
              variant="outline"
              className="w-full border-destructive/30 text-destructive hover:bg-destructive/10"
              disabled={isSavingAction}
              onClick={() => setDialogAction("cancel")}
            >
              Cancel booking
            </Button>
          )}

          {!isPendingBooking && !isCancellable && (
            <div className="rounded-xl border border-border bg-card p-4 text-xs text-muted-foreground">
              This booking is {getStatusLabel(booking.status).toLowerCase()} and no further status actions are available.
            </div>
          )}
        </div>
      </div>

      {dialogAction && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="presentation"
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="booking-action-title"
            className="w-full max-w-md space-y-4 rounded-xl border border-border bg-card p-6 shadow-xl"
          >
            <h2
              id="booking-action-title"
              className={`flex items-center gap-2 font-serif text-lg font-bold ${
                dialogAction === "reject" || dialogAction === "cancel"
                  ? "text-destructive"
                  : "text-foreground"
              }`}
            >
              {dialogAction === "approve" ? (
                <CheckCircle2 className="size-5" />
              ) : (
                <AlertTriangle className="size-5" />
              )}
              {dialogAction === "approve"
                ? "Approve reservation?"
                : dialogAction === "reject"
                  ? "Reject request?"
                  : "Cancel booking?"}
            </h2>
            <p className="text-xs leading-relaxed text-muted-foreground">
              {dialogAction === "approve"
                ? `Approve this stay for ${guestName}? The dates will be locked in the calendar.`
                : dialogAction === "reject"
                  ? `Reject the booking request from ${guestName}?`
                  : `Cancel the booking for ${guestName}?`}
            </p>
            {dialogAction === "cancel" && (
              <label className="block space-y-1.5 text-xs font-medium text-foreground">
                Cancellation reason{booking.status === "approved" ? " (required)" : " (optional)"}
                <textarea
                  value={cancelReason}
                  onChange={(event) => setCancelReason(event.target.value)}
                  maxLength={250}
                  rows={3}
                  className="w-full rounded-lg border border-input bg-background p-2.5 text-sm font-normal"
                  placeholder="Add a reason for cancelling"
                />
              </label>
            )}
            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                disabled={isSavingAction}
                onClick={() => {
                  setDialogAction(null);
                  setCancelReason("");
                }}
              >
                Keep booking
              </Button>
              <Button
                size="sm"
                variant={dialogAction === "approve" ? "default" : "destructive"}
                disabled={
                  isSavingAction ||
                  (dialogAction === "cancel" &&
                    booking.status === "approved" &&
                    !cancelReason.trim())
                }
                onClick={() => void completeBookingAction(dialogAction)}
              >
                {dialogAction === "approve"
                  ? "Confirm approval"
                  : dialogAction === "reject"
                    ? "Confirm rejection"
                    : "Confirm cancellation"}
              </Button>
            </div>
          </section>
        </div>
      )}

      {expandedProofUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          role="presentation"
          onClick={() => setExpandedProofUrl(null)}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-label="Full-size payment proof"
            className="relative max-h-[90vh] max-w-4xl rounded-xl bg-card p-3 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <Button
              variant="outline"
              size="icon-sm"
              aria-label="Close full-size payment proof"
              className="absolute right-5 top-5 z-10"
              onClick={() => setExpandedProofUrl(null)}
            >
              <X className="size-4" />
            </Button>
            <img
              src={expandedProofUrl}
              alt="Full-size GCash payment proof"
              className="max-h-[80vh] w-auto rounded-lg object-contain"
            />
          </section>
        </div>
      )}
    </div>
  );
};

export default BookingDetailsPage;

import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toaster";
import { useGetPublicBookingStatus } from "../hooks/useBooking";

const BookingStatusSkeleton = () => (
  <div className="container-page max-w-2xl space-y-5 py-10" role="status">
    <span className="block h-8 w-64 animate-pulse rounded bg-muted" />
    <span className="block h-24 animate-pulse rounded-xl bg-muted/60" />
    <span className="block h-20 animate-pulse rounded-xl bg-muted/60" />
  </div>
);

const statusLabel = (status: string) =>
  status.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());

export default function BookingStatusPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const showToast = useToast();
  const { data: booking, isPending, isError, error, refetch } =
    useGetPublicBookingStatus(id);

  if (isPending) return <BookingStatusSkeleton />;

  if (isError || !booking) {
    return (
      <div className="container-page max-w-2xl space-y-4 py-10">
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate(`/booking/${encodeURIComponent(id)}`)}
        >
          <ArrowLeft className="mr-2 size-4" />
          Back to booking
        </Button>
        <h1 className="font-serif text-2xl font-bold">Booking not found</h1>
        <p className="text-sm text-destructive" role="alert">
          {error instanceof Error
            ? error.message
            : "Check the reference ID and try again."}
        </p>
        <Button type="button" variant="outline" onClick={() => refetch()}>
          Try again
        </Button>
      </div>
    );
  }

  const copyReference = async () => {
    try {
      await navigator.clipboard.writeText(booking.id);
      showToast({
        title: "Reference copied",
        description: "Save this ID to return to your booking status.",
        variant: "success",
      });
    } catch {
      showToast({
        title: "Could not copy reference",
        description: "Please select and copy the booking reference manually.",
        variant: "error",
      });
    }
  };

  return (
    <div className="container-page max-w-2xl space-y-6 py-10 sm:py-14">
      <Button
        type="button"
        variant="outline"
        onClick={() => navigate(`/booking/${encodeURIComponent(id)}`)}
      >
        <ArrowLeft className="mr-2 size-4" />
        Back to booking
      </Button>
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-primary">
          Reservation status
        </p>
        <h1 className="font-serif text-2xl font-bold sm:text-3xl">
          Your booking, {booking.guestName}
        </h1>
        <p className="text-sm text-muted-foreground">
          This page refreshes automatically with the latest booking status.
        </p>
      </header>

      <section className="space-y-4 rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-7">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl bg-muted/40 p-4">
            <p className="text-xs text-muted-foreground">Stay dates</p>
            <p className="mt-1 text-sm font-semibold">
              {booking.checkIn} to {booking.checkOut}
            </p>
          </div>
          <div className="rounded-xl bg-secondary/60 p-4">
            <p className="text-xs text-muted-foreground">Booking status</p>
            <p className="mt-1 text-sm font-semibold">
              {statusLabel(booking.status)}
            </p>
          </div>
        </div>
        <div className="rounded-xl bg-muted/40 p-4">
          <p className="text-xs text-muted-foreground">Payment status</p>
          <p className="mt-1 text-sm font-semibold">
            {booking.paymentStatus === "pending_verification"
              ? "Pending verification"
              : statusLabel(booking.paymentStatus)}
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
          <p className="break-all text-xs text-muted-foreground">
            Reference ID: <span className="font-mono">{booking.id}</span>
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={copyReference}
          >
            <Copy className="mr-2 size-4" />
            Copy reference ID
          </Button>
        </div>
      </section>
    </div>
  );
}

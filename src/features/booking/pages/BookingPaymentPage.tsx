import { useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Check, CheckCircle2, Copy, House, Mail, Phone, ThumbsUp, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toaster";
import { ApiError } from "@/lib/axios";
import {
  useGetBookingPaymentDetails,
  useUploadPaymentProof,
} from "../hooks/useBooking";
import { PaymentProofSection } from "../components/PaymentProofSection";

const formatMoney = (amount: number) => `₱${amount.toLocaleString("en-PH")}`;

const BookingPaymentSkeleton = () => (
  <div
    className="container-page max-w-4xl space-y-6 py-8 sm:py-12"
    role="status"
    aria-label="Loading booking details"
  >
    <header className="space-y-3">
      <span className="block h-4 w-28 animate-pulse rounded bg-muted" />
      <span className="block h-9 w-64 animate-pulse rounded bg-muted" />
      <span className="block h-4 w-full max-w-xl animate-pulse rounded bg-muted/70" />
      <span className="block h-4 w-3/4 max-w-md animate-pulse rounded bg-muted/70" />
    </header>
    <section className="space-y-6 rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
      <div className="space-y-2 border-b border-border pb-5">
        <span className="block h-4 w-36 animate-pulse rounded bg-muted" />
        <span className="block h-5 w-56 animate-pulse rounded bg-muted/70" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <span className="h-20 animate-pulse rounded-xl bg-muted/60" />
        <span className="h-20 animate-pulse rounded-xl bg-muted/60" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <span className="h-24 animate-pulse rounded-xl bg-muted/60" />
        <span className="h-24 animate-pulse rounded-xl bg-muted/60" />
      </div>
      <span className="block h-28 animate-pulse rounded-xl bg-muted/60" />
      <span className="block h-36 animate-pulse rounded-xl bg-muted/60" />
      <div className="flex flex-wrap gap-3 border-t border-border pt-5">
        <span className="h-9 w-36 animate-pulse rounded-lg bg-muted" />
        <span className="h-9 w-40 animate-pulse rounded-lg bg-muted" />
      </div>
    </section>
  </div>
);

export default function BookingPaymentPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const showToast = useToast();
  const {
    data: booking,
    isPending,
    isError,
    error,
    refetch,
  } = useGetBookingPaymentDetails(id);
  const uploadProof = useUploadPaymentProof(id);
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState("");
  const [showReplacementUpload, setShowReplacementUpload] = useState(false);

  const submitProof = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!booking?.canUploadProof) return;
    if (!file) {
      setFileError("Choose a receipt image before submitting.");
      return;
    }

    setFileError("");
    try {
      const response = await uploadProof.mutateAsync(file);
      setFile(null);
      setShowReplacementUpload(false);
      showToast({
        title: "Payment proof received",
        description: response.message,
        variant: "success",
      });
    } catch (uploadError: unknown) {
      const message =
        uploadError instanceof ApiError
          ? uploadError.message
          : "Your receipt could not be uploaded. Please try again.";
      setFileError(message);
      showToast({
        title: "Upload failed",
        description: message,
        variant: "error",
      });
    }
  };

  const copyReference = async () => {
    if (!booking) return;
    try {
      await navigator.clipboard.writeText(booking.bookingId);
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

  if (isPending) {
    return <BookingPaymentSkeleton />;
  }

  if (isError || !booking) {
    return (
      <div className="container-page space-y-4 py-12">
        <h1 className="font-serif text-2xl font-bold">Booking not found</h1>
        <p className="text-sm text-destructive" role="alert">
          {error instanceof Error
            ? error.message
            : "Unable to load this booking. Check the reference link and try again."}
        </p>
        <Button type="button" variant="outline" onClick={() => refetch()}>
          Try again
        </Button>
      </div>
    );
  }

  const isBookingPending = booking.status === "pending";
  const remainingBalance = Math.max(
    booking.totalAmount - booking.downpaymentAmount,
    0,
  );
  const canShowPaymentInstructions =
    isBookingPending && booking.canUploadProof && !booking.paymentSubmitted;
  const showProofReceived =
    isBookingPending && booking.paymentSubmitted && !booking.paymentVerified;
  const isDeclined = ["rejected", "cancelled", "expired"].includes(
    booking.status,
  );

  return (
    <div className="container-page max-w-4xl space-y-6 py-8 sm:py-12">
      <header>
        <p className="text-xs font-semibold uppercase tracking-wider text-primary">
          Booking status
        </p>
        <h1 className="mt-2 font-serif text-2xl font-bold sm:text-3xl">
          {booking.status === "approved"
            ? "Booking confirmed"
            : isDeclined
              ? "Booking update"
              : "Payment and booking details"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          This page updates as your booking status changes. Save your reference
          ID so you can return here later.
        </p>
      </header>

      <section className="space-y-5 rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Booking reference ID
          </p>
          <p className="mt-1 break-all font-mono text-sm font-semibold">
            {booking.bookingId}
          </p>
        </div>

        {(booking.status === "approved" || showProofReceived) && (
          <div
            className="flex items-start gap-3 rounded-xl border border-success/30 bg-success/10 p-4 text-success"
            role="status"
          >
            <Check className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
            <div>
              <h2 className="font-semibold">
                {booking.status === "approved"
                  ? "Booking Confirmed!"
                  : "Payment Receipt Uploaded Successfully!"}
              </h2>
              <p className="mt-1 text-sm">
                {booking.status === "approved"
                  ? "Your booking is confirmed. The host will send your check-in details before arrival."
                  : "We have received your screenshot. The host will verify your GCash transaction shortly."}
              </p>
            </div>
          </div>
        )}

        {isDeclined && (
          <div
            className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-destructive"
            role="alert"
          >
            <h2 className="font-semibold">
              {booking.status === "expired"
                ? "Booking hold expired"
                : "Booking request declined"}
            </h2>
            <p className="mt-1 text-sm">
              {booking.cancellationReason ||
                (booking.status === "expired"
                  ? "The payment hold expired before the booking was confirmed."
                  : "This booking can no longer be accepted. Please contact the host if you need more information.")}
            </p>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl bg-muted/40 p-4">
            <p className="text-xs text-muted-foreground">Dates</p>
            <p className="mt-1 text-sm font-semibold">
              {booking.checkIn} to {booking.checkOut}
            </p>
          </div>
          <div className="rounded-xl bg-secondary/60 p-4">
            <p className="text-xs text-muted-foreground">Booking status</p>
            <p className="mt-1 text-sm font-semibold capitalize">
              {booking.status}
            </p>
          </div>
        </div>

        {booking.status !== "approved" && !isDeclined && (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl bg-muted/40 p-4">
              <p className="text-xs text-muted-foreground">
                Required downpayment (50%)
              </p>
              <p className="mt-1 font-serif text-xl font-bold text-primary">
                {formatMoney(booking.downpaymentAmount)}
              </p>
            </div>
            <div className="rounded-xl bg-muted/40 p-4">
              <p className="text-xs text-muted-foreground">
                Remaining balance due at check-in
              </p>
              <p className="mt-1 text-lg font-semibold">
                {formatMoney(remainingBalance)}
              </p>
            </div>
          </div>
        )}

        {canShowPaymentInstructions && (
          <div className="rounded-xl border border-blue-200/80 bg-[#f2f7ff] p-5">
            <p className="text-xs font-bold uppercase tracking-wider text-blue-700">
              GCash transfer
            </p>
            <p className="mt-2 text-sm font-bold text-foreground">
              Maximilliane M.
            </p>
            <p className="font-mono text-sm text-muted-foreground">
              0917-888-1234
            </p>
            <p className="mt-3 text-xs text-muted-foreground">
              The GCash QR code is not available yet. You can transfer using
              the mobile number above.
            </p>
          </div>
        )}

      
{showProofReceived && (
  <div className="rounded-2xl border bg-card p-5 space-y-5 shadow-sm">

    {/* Success Header */}
    <div className="flex items-start gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-600">
        <CheckCircle2 className="h-5 w-5" />
      </div>
      <div className="space-y-1">
        <h3 className="font-semibold">Receipt submitted!</h3>
        <p className="text-sm text-muted-foreground">
          Your payment is awaiting verification. This usually takes 1–12 hours.
        </p>
      </div>
    </div>

    {/* Booking Reference */}
    <div className="rounded-xl bg-muted/50 p-3">
      <p className="text-xs text-muted-foreground mb-2">
        BOOKING REFERENCE
      </p>
      <div className="flex items-center justify-between gap-2">
        <code className="text-xs break-all">
          84cb4188-a365-4df4-9ef4-a859a0bd39f8
        </code>
        <button
          type="button"
          onClick={() =>
            navigator.clipboard.writeText(
              "84cb4188-a365-4df4-9ef4-a859a0bd39f8"
            )
          }
          className="text-xs font-semibold text-primary hover:opacity-70"
        >
          Copy
        </button>
      </div>
    </div>

    {/* Support */}
    <div className="space-y-3">
      <div>
        <p className="text-sm font-medium">Need assistance?</p>
        <p className="text-xs text-muted-foreground">
          Contact us for booking updates or concerns.
        </p>
      </div>

      <div className="flex flex-col gap-2 text-sm">
        <a
          href="https://www.facebook.com/maximillianeshaven"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-muted-foreground hover:text-primary"
        >
          <ThumbsUp className="h-4 w-4" />
          Maximilline's Haven
        </a>

        <a
          href="mailto:maximillianeshaven@gmail.com"
          className="flex items-center gap-2 text-muted-foreground hover:text-primary"
        >
          <Mail className="h-4 w-4" />
          maximillianeshaven@gmail.com
        </a>

        <a
          href="tel:09668338675"
          className="flex items-center gap-2 text-muted-foreground hover:text-primary"
        >
          <Phone className="h-4 w-4" />
          0966-833-8675
        </a>
      </div>
    </div>

    <p className="border-t pt-3 text-xs text-muted-foreground">
      Please keep your reference ID for inquiries. No need to submit another
      booking while waiting for verification.
    </p>
  </div>
)}


        {canShowPaymentInstructions && (
          <form onSubmit={submitProof} className="space-y-4">
            <PaymentProofSection
              file={file}
              error={fileError}
              disabled={uploadProof.isPending}
              onFileChange={setFile}
              onError={setFileError}
            />
            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={uploadProof.isPending}
            >
              {uploadProof.isPending
                ? "Uploading proof..."
                : "Submit payment proof"}
            </Button>
          </form>
        )}

        {showProofReceived && booking.canUploadProof && (
          <div className="space-y-3">
            {!showReplacementUpload ? (
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowReplacementUpload(true)}
              >
                <Upload className="mr-2 size-4" />
                Upload replacement proof
              </Button>
            ) : (
              <form onSubmit={submitProof} className="space-y-4">
                <PaymentProofSection
                  file={file}
                  error={fileError}
                  disabled={uploadProof.isPending}
                  onFileChange={setFile}
                  onError={setFileError}
                />
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="submit"
                    disabled={uploadProof.isPending}
                  >
                    {uploadProof.isPending
                      ? "Uploading proof..."
                      : "Submit replacement proof"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={uploadProof.isPending}
                    onClick={() => {
                      setShowReplacementUpload(false);
                      setFile(null);
                      setFileError("");
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            )}
          </div>
        )}

        {booking.status === "pending" && !booking.canUploadProof && (
          <p className="text-sm text-muted-foreground">
            This booking hold has expired or is no longer accepting payment
            proof. Please contact the host if you need assistance.
          </p>
        )}

        <div className="flex flex-wrap gap-3 border-t border-border pt-5">
          <Button type="button" variant="outline" onClick={copyReference}>
            <Copy className="mr-2 size-4" />
            Copy reference ID
          </Button>
          <Button type="button" onClick={() => navigate("/")}>
            <House className="mr-2 size-4" />
            Return to home page
          </Button>
        </div>
      </section>
    </div>
  );
}

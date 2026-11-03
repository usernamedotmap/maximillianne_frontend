import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toaster";
import { ApiError } from "@/lib/axios";
import { useCreateBooking, useGetCalendar } from "../hooks/useBooking";
import {
  CreateBookingRequestSchema,
  type BookingFormInput,
  type BookingFormValues,
} from "../schema/booking.schema";
import { BookingSummary } from "../components/BookingSummary";
import { GuestDetailsSection } from "../components/GuestDetailsSection";
import { StayDetailsSection } from "../components/StayDetailsSection";

const bookingFieldPaths = [
  "guest.fullName",
  "guest.phone",
  "guest.email",
  "booking.checkIn",
  "booking.checkOut",
  "booking.guestCount",
  "booking.notes",
] as const;

type BookingFieldPath = (typeof bookingFieldPaths)[number];

const isBookingFieldPath = (path: string): path is BookingFieldPath =>
  bookingFieldPaths.some((field) => field === path);

export default function BookingRequestPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const showToast = useToast();
  const checkIn = searchParams.get("checkIn");
  const checkOut = searchParams.get("checkOut");
  const parsedNights = Number(searchParams.get("nights"));
  const nights = Number.isFinite(parsedNights) && parsedNights > 0
    ? parsedNights
    : 0;
  const calendarMonth =
    checkIn?.slice(0, 7) ?? new Date().toISOString().slice(0, 7);
  const {
    data: calendar,
    isFetching: isCalendarFetching,
    isError: isCalendarError,
    error: calendarError,
    refetch: refetchCalendar,
  } = useGetCalendar(calendarMonth);
  const createBooking = useCreateBooking();
  const [submissionError, setSubmissionError] = useState("");
  const [availabilityConflict, setAvailabilityConflict] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submissionInProgress = useRef(false);

  const {
    register,
    handleSubmit,
    setError,
    control,
    formState: { errors },
  } = useForm<BookingFormInput, unknown, BookingFormValues>({
    resolver: zodResolver(CreateBookingRequestSchema),
    defaultValues: {
      guest: { fullName: "", email: "", phone: "" },
      booking: {
        checkIn: checkIn ?? "",
        checkOut: checkOut ?? "",
        guestCount: 1,
        notes: "",
      },
    },
  });

  const guestCount = Number(useWatch({ control, name: "booking.guestCount" }) ?? 1);
  const nightlyRate =
    calendar?.days.find((day) => day.date === checkIn)?.rate ??
    calendar?.days[0]?.rate;

  const onSubmit = async (values: BookingFormValues) => {
    if (submissionInProgress.current) return;
    submissionInProgress.current = true;
    setIsSubmitting(true);
    setSubmissionError("");
    setAvailabilityConflict(false);

    try {
      const response = await createBooking.mutateAsync({
        guest: {
          ...values.guest,
          email: values.guest.email?.trim() || undefined,
        },
        booking: {
          ...values.booking,
          notes: values.booking.notes?.trim() || undefined,
        },
      });
      const bookingId = response.bookings.bookingId;
      if (!bookingId) {
        throw new Error("The server did not return a booking reference.");
      }

      showToast({
        title: "Booking request created",
        description: "Continue to payment instructions and upload your receipt.",
        variant: "success",
      });
      navigate(`/booking/${encodeURIComponent(bookingId)}`, {
        replace: true,
      });
    } catch (error: unknown) {
      const apiError = error instanceof ApiError ? error : undefined;
      let hasMappedFieldError = false;

      for (const detail of apiError?.details ?? []) {
        if (isBookingFieldPath(detail.field)) {
          setError(detail.field, {
            type: "server",
            message: detail.message,
          });
          hasMappedFieldError = true;
        }
      }

      const isConflict = apiError?.status === 409;
      const message = isConflict
        ? "These dates are no longer available. Please choose different dates."
        : hasMappedFieldError
          ? "Please review the highlighted booking details."
          : apiError?.message ??
            (error instanceof Error
              ? error.message
              : "The booking could not be created. Please try again.");
      setAvailabilityConflict(isConflict);
      setSubmissionError(message);
      showToast({
        title: isConflict ? "Dates no longer available" : "Request not submitted",
        description: message,
        variant: "error",
      });
    } finally {
      submissionInProgress.current = false;
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container-page space-y-8 py-8 sm:py-12">
      <header>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => navigate("/availability")}
          className="-ml-2 text-muted-foreground"
        >
          <ArrowLeft className="mr-1 size-3.5" />
          Back to dates
        </Button>
        <h1 className="mt-2 font-serif text-2xl font-bold sm:text-3xl">
          Request your stay
        </h1>
        <p className="text-sm text-muted-foreground">
          Step 1 of 2 · Enter your details to create a booking request.
        </p>
      </header>

      <form
        className="grid items-start gap-6 lg:grid-cols-12"
        onSubmit={handleSubmit(onSubmit)}
        noValidate
      >
        <div className="space-y-5 lg:col-span-8">
          <GuestDetailsSection register={register} errors={errors} />
          <StayDetailsSection register={register} errors={errors} />

          {(errors.booking?.checkIn?.message ||
            errors.booking?.checkOut?.message) && (
            <div className="rounded-lg border border-destructive/40 p-3 text-sm text-destructive" role="alert">
              {errors.booking.checkIn?.message && (
                <p>Check-in: {errors.booking.checkIn.message}</p>
              )}
              {errors.booking.checkOut?.message && (
                <p>Check-out: {errors.booking.checkOut.message}</p>
              )}
            </div>
          )}

          {submissionError && (
            <div
              className="space-y-2 rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive"
              role="alert"
            >
              <p>{submissionError}</p>
              {availabilityConflict && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => navigate("/availability")}
                >
                  Choose different dates
                </Button>
              )}
            </div>
          )}

          <Button
            type="submit"
            size="lg"
            disabled={isSubmitting}
            className="w-full"
          >
            {isSubmitting ? "Creating request..." : "Submit request"}
            {!isSubmitting && <ArrowRight className="ml-2 size-4" />}
          </Button>
        </div>

        <aside className="lg:sticky lg:top-24 lg:col-span-4">
          {isCalendarFetching ? (
            <div
              className="space-y-4 rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6"
              role="status"
              aria-label="Loading stay summary"
            >
              <span className="block h-6 w-32 animate-pulse rounded bg-muted" />
              {Array.from({ length: 6 }, (_, index) => (
                <div
                  key={`summary-row-${index}`}
                  className="flex items-center justify-between gap-4 border-b border-border/60 py-2"
                >
                  <span className="h-4 w-28 animate-pulse rounded bg-muted/70" />
                  <span className="h-4 w-20 animate-pulse rounded bg-muted/70" />
                </div>
              ))}
              <span className="block h-16 animate-pulse rounded-lg bg-muted/60" />
            </div>
          ) : (
            <>
              <BookingSummary
                checkIn={checkIn}
                checkOut={checkOut}
                nights={nights}
                guestCount={guestCount}
                nightlyRate={nightlyRate}
              />
              {isCalendarError && (
                <div
                  className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-destructive/40 p-3 text-xs text-destructive"
                  role="alert"
                >
                  <span>
                    {calendarError instanceof Error
                      ? calendarError.message
                      : "Unable to load current pricing."}
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => refetchCalendar()}
                  >
                    Retry
                  </Button>
                </div>
              )}
            </>
          )}
        </aside>
      </form>
    </div>
  );
}

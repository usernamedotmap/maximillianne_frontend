import { Textarea } from "@/components/ui/textarea";
import type { FieldErrors, UseFormRegister } from "react-hook-form";
import type { BookingFormInput } from "../schema/booking.schema";

type StayDetailsSectionProps = {
  register: UseFormRegister<BookingFormInput>;
  errors: FieldErrors<BookingFormInput>;
};

export function StayDetailsSection({
  register,
  errors,
}: StayDetailsSectionProps) {
  return (
    <section className="space-y-4 rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
      <h2 className="border-b border-border pb-3 font-serif text-lg font-bold">
        Stay details
      </h2>
      <div>
        <label htmlFor="booking-guest-count" className="mb-1.5 block text-xs font-semibold">
          Number of guests
        </label>
        <select
          id="booking-guest-count"
          className="h-9 w-full rounded-md border border-input bg-card px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
          aria-invalid={Boolean(errors.booking?.guestCount)}
          {...register("booking.guestCount")}
        >
          {[1, 2, 3, 4, 5, 6].map((count) => (
            <option key={count} value={count}>
              {count} {count === 1 ? "guest" : "guests"}
            </option>
          ))}
        </select>
        {errors.booking?.guestCount?.message && (
          <p className="mt-1 text-xs text-destructive" role="alert">
            {errors.booking.guestCount.message}
          </p>
        )}
      </div>
      <div>
        <label htmlFor="booking-notes" className="mb-1.5 block text-xs font-semibold">
          Special requests <span className="font-normal text-muted-foreground">(optional)</span>
        </label>
        <Textarea
          id="booking-notes"
          rows={3}
          placeholder="Arrival details or other preferences..."
          aria-invalid={Boolean(errors.booking?.notes)}
          {...register("booking.notes")}
        />
        {errors.booking?.notes?.message && (
          <p className="mt-1 text-xs text-destructive" role="alert">
            {errors.booking.notes.message}
          </p>
        )}
      </div>
    </section>
  );
}

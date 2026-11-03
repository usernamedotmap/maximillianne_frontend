import { Input } from "@/components/ui/input";
import type { FieldErrors, UseFormRegister } from "react-hook-form";
import type { BookingFormInput } from "../schema/booking.schema";

type GuestDetailsSectionProps = {
  register: UseFormRegister<BookingFormInput>;
  errors: FieldErrors<BookingFormInput>;
};

export function GuestDetailsSection({
  register,
  errors,
}: GuestDetailsSectionProps) {
  return (
    <section className="space-y-4 rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
      <h2 className="border-b border-border pb-3 font-serif text-lg font-bold">
        Guest information
      </h2>
      <div>
        <label htmlFor="guest-full-name" className="mb-1.5 block text-xs font-semibold">
          Full name
        </label>
        <Input
          id="guest-full-name"
          placeholder="e.g. Alex Santos"
          autoComplete="name"
          aria-invalid={Boolean(errors.guest?.fullName)}
          {...register("guest.fullName")}
        />
        {errors.guest?.fullName?.message && (
          <p className="mt-1 text-xs text-destructive" role="alert">
            {errors.guest.fullName.message}
          </p>
        )}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="guest-phone" className="mb-1.5 block text-xs font-semibold">
            Phone number
          </label>
          <Input
            id="guest-phone"
            placeholder="+63 917 123 4567"
            autoComplete="tel"
            aria-invalid={Boolean(errors.guest?.phone)}
            {...register("guest.phone")}
          />
          {errors.guest?.phone?.message && (
            <p className="mt-1 text-xs text-destructive" role="alert">
              {errors.guest.phone.message}
            </p>
          )}
        </div>
        <div>
          <label htmlFor="guest-email" className="mb-1.5 block text-xs font-semibold">
            Email address <span className="font-normal text-muted-foreground">(optional)</span>
          </label>
          <Input
            id="guest-email"
            type="email"
            placeholder="alex@example.com"
            autoComplete="email"
            aria-invalid={Boolean(errors.guest?.email)}
            {...register("guest.email")}
          />
          {errors.guest?.email?.message && (
            <p className="mt-1 text-xs text-destructive" role="alert">
              {errors.guest.email.message}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

import { z } from "zod";
import { CreateGuestSchema } from "../../guest/schema/guest.schema";

// --------- input validation ----------- //
export const CreateBookingSchema = z
  .object({
    checkIn: z.iso.date("Check-in must follow the YYYY-MM-DD format"),
    checkOut: z.iso.date("Check-out must follow the YYYY-MM-DD format"),
    guestCount: z.coerce
      .number()
      .int()
      .min(1, "Guest count must be at least 1")
      .max(6, "Guest count must be at most 6"),
    notes: z.string().trim().max(65535).optional(),
  })
  .refine(({ checkIn, checkOut }) => checkOut > checkIn, {
    message: "Check-out must be after check-in",
    path: ["checkOut"],
  });

export type CreateBookingInput = z.infer<typeof CreateBookingSchema>;

export const CreateBookingRequestSchema = z.object({
  guest: CreateGuestSchema,
  booking: CreateBookingSchema,
});

// Form controls produce strings; the resolver converts guestCount to a number.
export type BookingFormInput = z.input<typeof CreateBookingRequestSchema>;
export type BookingFormValues = z.output<typeof CreateBookingRequestSchema>;

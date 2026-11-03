export const LAST_BOOKING_TRACKING_REFERENCE_KEY =
  "maximilliane-haven:last-booking-tracking-reference";
export const BOOKING_TRACKING_UPDATED_EVENT = "booking-tracking-updated";

export const readLastBookingTrackingReference = (): string | null => {
  try {
    return localStorage.getItem(LAST_BOOKING_TRACKING_REFERENCE_KEY);
  } catch (error) {
    console.warn("Could not read the saved booking reference.", error);
    return null;
  }
};

export const saveLastBookingTrackingReference = (reference: string): void => {
  try {
    localStorage.setItem(LAST_BOOKING_TRACKING_REFERENCE_KEY, reference);
    window.dispatchEvent(new Event(BOOKING_TRACKING_UPDATED_EVENT));
  } catch (error) {
    console.warn("Could not save the booking reference in this browser.", error);
  }
};

export const clearLastBookingTrackingReference = (): void => {
  try {
    localStorage.removeItem(LAST_BOOKING_TRACKING_REFERENCE_KEY);
    window.dispatchEvent(new Event(BOOKING_TRACKING_UPDATED_EVENT));
  } catch (error) {
    console.warn("Could not remove the saved booking reference.", error);
  }
};

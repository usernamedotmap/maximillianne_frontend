import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type BookingSummaryProps = {
  checkIn: string | null;
  checkOut: string | null;
  nights: number;
  guestCount: number;
  nightlyRate?: number;
};

const formatMoney = (amount: number) => `₱${amount.toLocaleString("en-PH")}`;

export function BookingSummary({
  checkIn,
  checkOut,
  nights,
  guestCount,
  nightlyRate,
}: BookingSummaryProps) {
  const total = nightlyRate === undefined ? undefined : nightlyRate * nights;
  const downpayment = total === undefined ? undefined : Math.round(total * 0.5);

  return (
    <Card className="rounded-2xl border border-border bg-card shadow-sm">
      <CardHeader className="border-b border-border pb-4">
        <CardTitle className="font-serif text-base font-bold">Stay summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 pt-5 text-sm">
        <SummaryRow
          label="Dates"
          value={checkIn && checkOut ? `${checkIn} to ${checkOut}` : "—"}
        />
        <SummaryRow
          label="Duration"
          value={nights > 0 ? `${nights} ${nights === 1 ? "night" : "nights"}` : "—"}
        />
        <SummaryRow
          label="Guests"
          value={`${guestCount} ${guestCount === 1 ? "guest" : "guests"}`}
        />
        <SummaryRow
          label="Rate per night"
          value={nightlyRate === undefined ? "—" : formatMoney(nightlyRate)}
        />
        <SummaryRow
          label="Estimated total"
          value={total === undefined ? "—" : formatMoney(total)}
        />
        <SummaryRow
          label="Estimated 50% downpayment"
          value={downpayment === undefined ? "—" : formatMoney(downpayment)}
          emphasized
        />
        <p className="rounded-lg bg-muted/40 p-3 text-xs leading-relaxed text-muted-foreground">
          The final price and required downpayment are confirmed by the server
          after your booking request is submitted.
        </p>
      </CardContent>
    </Card>
  );
}

function SummaryRow({
  label,
  value,
  emphasized = false,
}: {
  label: string;
  value: string;
  emphasized?: boolean;
}) {
  return (
    <div className={`flex items-center justify-between gap-4 border-b border-border/60 py-1 ${emphasized ? "font-semibold text-primary" : ""}`}>
      <span className={emphasized ? "" : "text-muted-foreground"}>{label}</span>
      <span className="text-right font-semibold">{value}</span>
    </div>
  );
}

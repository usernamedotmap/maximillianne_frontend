import * as React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Info } from "lucide-react";
import { useGetCalendar } from "../hooks/useBooking";
import {
  addMonths,
  differenceInCalendarDays,
  format,
  getDay,
  getDaysInMonth,
  isAfter,
  isBefore,
  isSameDay,
  startOfDay,
  startOfMonth,
} from "date-fns";

export default function AvailabilityPage() {
  const navigate = useNavigate();
  const today = startOfDay(new Date());
  const currentMonth = startOfMonth(today);
  const [viewDate, setViewDate] = React.useState(() => startOfMonth(new Date()));
  const isCurrentOrPastMonth = !isAfter(viewDate, currentMonth);
  const monthParam = format(viewDate, "yyyy-MM");
  const {
    data: calendar,
    isFetching,
    isError,
    error,
    refetch,
  } = useGetCalendar(monthParam);

  // Selected date range state
  const [selectedStart, setSelectedStart] = React.useState<Date | null>(null);
  const [selectedEnd, setSelectedEnd] = React.useState<Date | null>(null);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const prevMonth = () => {
    setViewDate((date) =>
      isAfter(date, currentMonth) ? addMonths(date, -1) : date,
    );
  };

  const nextMonth = () => {
    setViewDate((date) => addMonths(date, 1));
  };

  const daysInMonth = getDaysInMonth(viewDate);
  const firstDayIndex = getDay(startOfMonth(viewDate));
  const statusByDate = React.useMemo(
    () => new Map(calendar?.days.map((day) => [day.date, day.status]) ?? []),
    [calendar],
  );
  const getDateStatus = (date: Date) => statusByDate.get(format(date, "yyyy-MM-dd"));

  const handleDateClick = (date: Date) => {
    const dateStatus = getDateStatus(date);
    if (
      isBefore(date, today) ||
      !dateStatus ||
      dateStatus === "reserved" ||
      dateStatus === "blocked"
    ) {
      return; // Cannot select booked dates
    }

    if (!selectedStart || (selectedStart && selectedEnd)) {
      setSelectedStart(date);
      setSelectedEnd(null);
    } else if (selectedStart && !selectedEnd) {
      if (date < selectedStart) {
        setSelectedStart(date);
        setSelectedEnd(null);
      } else if (isSameDay(date, selectedStart)) {
        setSelectedStart(null);
        setSelectedEnd(null);
      } else {
        setSelectedEnd(date);
      }
    }
  };

  // Calculate pricing
  const nights =
    selectedStart && selectedEnd
      ? differenceInCalendarDays(selectedEnd, selectedStart)
      : 0;

  const nightlyRate = calendar?.days[0]?.rate;
  const estimatedTotal = nights * (nightlyRate ?? 0);

  const handleProceed = () => {
    if (!selectedStart || !selectedEnd) return;
    const startStr = format(selectedStart, "yyyy-MM-dd");
    const endStr = format(selectedEnd, "yyyy-MM-dd");
    navigate(`/booking/request?checkIn=${startStr}&checkOut=${endStr}&nights=${nights}`);
  };

  const formatDisplayDate = (d: Date | null) => {
    if (!d) return "—";
    return format(d, "MMM d, yyyy");
  };

  return (
    <div className="container-page py-8 sm:py-12 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-foreground">
          Check Availability
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Select your desired staycation dates to begin. We update availability in real-time.
        </p>
      </div>

      {isError && (
        <div className="flex items-center gap-3 text-sm text-destructive" role="alert">
          <span>
            {error instanceof Error ? error.message : "Unable to load availability."}
          </span>
          <Button type="button" variant="outline" size="sm" onClick={() => refetch()}>
            Try again
          </Button>
        </div>
      )}

      {isFetching ? (
        <div
          className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12"
          role="status"
          aria-label="Loading availability calendar"
        >
          <div className="space-y-6 rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-8 lg:col-span-8">
            <div className="flex flex-wrap gap-4">
              {Array.from({ length: 4 }, (_, index) => (
                <div key={`legend-${index}`} className="flex items-center gap-2">
                  <span className="h-3.5 w-3.5 animate-pulse rounded-full bg-muted" />
                  <span className="h-3 w-16 animate-pulse rounded bg-muted" />
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between border-y border-border py-3">
              <span className="h-8 w-8 animate-pulse rounded-lg bg-muted" />
              <span className="h-6 w-36 animate-pulse rounded bg-muted" />
              <span className="h-8 w-8 animate-pulse rounded-lg bg-muted" />
            </div>
            <div className="grid grid-cols-7 gap-1 text-center sm:gap-2">
              {Array.from({ length: 7 }, (_, index) => (
                <span
                  key={`weekday-${index}`}
                  className="mx-auto h-4 w-6 animate-pulse rounded bg-muted/60"
                />
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1 sm:gap-2">
              {Array.from({ length: 42 }, (_, index) => (
                <span
                  key={`calendar-day-${index}`}
                  className="h-11 animate-pulse rounded-xl bg-muted/70 sm:h-14"
                />
              ))}
            </div>
            <div className="h-12 animate-pulse rounded-lg bg-muted/60" />
          </div>
          <div className="lg:col-span-4">
            <div className="space-y-5 rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
              <span className="block h-6 w-40 animate-pulse rounded bg-muted" />
              <span className="block h-4 w-full animate-pulse rounded bg-muted/70" />
              {Array.from({ length: 4 }, (_, index) => (
                <span
                  key={`selection-${index}`}
                  className="block h-8 w-full animate-pulse rounded bg-muted/70"
                />
              ))}
              <span className="block h-20 w-full animate-pulse rounded-xl bg-muted/60" />
              <span className="block h-10 w-full animate-pulse rounded-lg bg-muted" />
            </div>
          </div>
        </div>
      ) : (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Calendar & Legend */}
        <div className="lg:col-span-8 bg-card border border-border rounded-2xl p-4 sm:p-8 shadow-sm space-y-6">
          {/* Status Legend */}
          <div className="flex flex-wrap items-center gap-4 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-full border border-border bg-card" />
              <span className="text-muted-foreground">Open</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-full bg-pending border border-pending" />
              <span className="text-muted-foreground">Pending Review</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-full bg-reserved border border-reserved" />
              <span className="text-muted-foreground">Reserved Date</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-full bg-muted border border-border" />
              <span className="text-muted-foreground">Blocked</span>
            </div>
          </div>

          {/* Month Header Navigation */}
          <div className="flex items-center justify-between border-t border-b border-border py-3">
            <Button
              variant="outline"
              size="icon-sm"
              onClick={prevMonth}
              disabled={isCurrentOrPastMonth}
              aria-label="Previous month"
              className="text-muted-foreground hover:text-foreground"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <h2 className="font-serif text-lg sm:text-xl font-bold text-foreground">
              {format(viewDate, "MMMM yyyy")}
            </h2>
            <Button
              variant="outline"
              size="icon-sm"
              onClick={nextMonth}
              className="text-muted-foreground hover:text-foreground"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          {/* Weekday Labels */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center text-xs font-semibold text-muted-foreground">
            <span>Su</span>
            <span>Mo</span>
            <span>Tu</span>
            <span>We</span>
            <span>Th</span>
            <span>Fr</span>
            <span>Sa</span>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {/* Blank leading slots */}
            {Array.from({ length: firstDayIndex }).map((_, idx) => (
              <div key={`blank-${idx}`} className="h-10 sm:h-14 opacity-20" />
            ))}

            {/* Days of current month */}
            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const dayNum = idx + 1;
              const thisDate = new Date(year, month, dayNum);
              const status = getDateStatus(thisDate);
              const isPastDate = isBefore(thisDate, today);

              const isStart =
                selectedStart && isSameDay(thisDate, selectedStart);
              const isEnd =
                selectedEnd && isSameDay(thisDate, selectedEnd);
              const isInRange =
                selectedStart &&
                selectedEnd &&
                isAfter(thisDate, selectedStart) &&
                isBefore(thisDate, selectedEnd);

              const isReserved = status === "reserved";
              const isPendingDate = status === "pending";
              const isBlocked = status === "blocked";
              const isDisabled = isPastDate || !status || isReserved || isBlocked;

              return (
                <button
                  key={dayNum}
                  type="button"
                  disabled={isDisabled}
                  onClick={() => handleDateClick(thisDate)}
                  className={`relative h-11 sm:h-14 rounded-xl flex flex-col items-center justify-center text-xs sm:text-sm font-medium transition-all ${
                    isStart || isEnd
                      ? "bg-primary text-primary-foreground font-bold shadow-sm z-10"
                      : isInRange
                      ? "bg-primary/15 text-primary font-semibold"
                      : isReserved
                      ? "bg-reserved text-reserved-foreground opacity-90 cursor-not-allowed"
                      : isPendingDate
                      ? "bg-pending text-pending-foreground hover:ring-1 hover:ring-pending-border"
                      : isBlocked
                      ? "bg-blocked text-muted-foreground/60 opacity-60 cursor-not-allowed"
                      : isPastDate
                      ? "bg-muted text-muted-foreground/50 cursor-not-allowed"
                      : "bg-background/80 hover:bg-muted/80 text-foreground border border-border/50"
                  }`}
                >
                  <span>{dayNum}</span>
                  {isReserved && (
                    <span className="text-[9px] uppercase tracking-tighter opacity-80 mt-0.5 hidden sm:block">
                      Booked
                    </span>
                  )}
                  {isPendingDate && (
                    <span className="text-[9px] uppercase tracking-tighter opacity-80 mt-0.5 hidden sm:block">
                      Pending
                    </span>
                  )}
                  {isBlocked && (
                    <span className="text-[9px] uppercase tracking-tighter opacity-80 mt-0.5 hidden sm:block">
                      Hold
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/40 p-3 rounded-lg border border-border/60">
            <Info className="w-4 h-4 text-primary shrink-0" />
            <span>
              Click on a start date, then click on your checkout date to select a range. Dates marked
              pending may still become available.
            </span>
          </div>
        </div>

        {/* Right: Selection Details Card */}
        <div className="lg:col-span-4 sticky top-24">
          <Card className="border border-border shadow-sm rounded-2xl bg-card">
            <CardHeader className="pb-4 border-b border-border">
              <CardTitle className="text-base font-serif font-bold text-foreground">
                Selection Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-5 text-xs sm:text-sm">
              <div className="flex items-center justify-between py-1 border-b border-border/60">
                <span className="text-muted-foreground">Selected Period</span>
                <span className="font-semibold text-foreground">
                  {selectedStart && selectedEnd
                    ? `${formatDisplayDate(selectedStart)} - ${formatDisplayDate(selectedEnd)}`
                    : selectedStart
                    ? `${formatDisplayDate(selectedStart)} (Select check-out)`
                    : "None selected"}
                </span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-border/60">
                <span className="text-muted-foreground">Total Duration</span>
                <span className="font-semibold text-foreground">
                  {nights > 0 ? `${nights} ${nights === 1 ? "Night" : "Nights"}` : "—"}
                </span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-border/60">
                <span className="text-muted-foreground">Nightly Condo Rate</span>
                <span className="font-semibold text-foreground">
                  {nightlyRate === undefined ? "—" : `₱${nightlyRate.toLocaleString()}`}
                </span>
              </div>

              <div className="pt-2 flex items-center justify-between text-base font-serif font-bold text-foreground">
                <span>Estimated Total</span>
                <span className="text-primary text-xl">
                  {nightlyRate === undefined ? "—" : `₱${estimatedTotal.toLocaleString()}`}
                </span>
              </div>

              {/* Direct Booking Note */}
              <div className="bg-secondary/60 rounded-xl p-3 text-xs text-muted-foreground space-y-1 border border-border/60">
                <p className="font-medium text-foreground">Direct Booking Note:</p>
                <p className="text-[11px] leading-relaxed">
                  Date ranges remain open for others until downpayment receipt is verified. We require
                  a ₱1,500 GCash downpayment to secure the slot.
                </p>
              </div>

              <Button
                disabled={!calendar || !selectedStart || !selectedEnd || nights === 0}
                onClick={handleProceed}
                className="w-full bg-primary hover:bg-primary-hover text-primary-foreground font-medium py-2.5 rounded-lg shadow-sm"
              >
                Request These Dates
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
      )}
    </div>
  );
}

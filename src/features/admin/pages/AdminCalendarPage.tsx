import { useMemo, useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addMonths,
  format,
  getDay,
  getDaysInMonth,
  startOfMonth,
} from "date-fns";
import { AlertCircle, Ban, ChevronLeft, ChevronRight, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toaster";
import { adminBookingService, type AdminBlockedDate } from "@/service/admin-booking";
import { useGetCalendar } from "@/features/booking/hooks/useBooking";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "Please try again.";

const getDateKey = (value: string) => value.slice(0, 10);

const formatDate = (value: string) =>
  format(new Date(`${getDateKey(value)}T00:00:00`), "MMM d, yyyy");

const formatBlockRange = (block: AdminBlockedDate) =>
  `${formatDate(block.startDate)} - ${formatDate(block.endDate)} (end date excluded)`;

const AdminCalendarSkeleton = () => (
  <div
    className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12"
    role="status"
    aria-label="Loading admin calendar"
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
        {WEEKDAYS.map((weekday) => (
          <span
            key={`weekday-${weekday}`}
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
    <aside className="space-y-5 rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6 lg:col-span-4">
      <span className="block h-6 w-40 animate-pulse rounded bg-muted" />
      <span className="block h-4 w-full animate-pulse rounded bg-muted/70" />
      {Array.from({ length: 4 }, (_, index) => (
        <span
          key={`summary-${index}`}
          className="block h-8 w-full animate-pulse rounded bg-muted/70"
        />
      ))}
      <span className="block h-5 w-40 animate-pulse rounded bg-muted" />
      <span className="block h-16 w-full animate-pulse rounded-lg bg-muted/60" />
    </aside>
  </div>
);

const AdminCalendarPage = () => {
  const queryClient = useQueryClient();
  const toast = useToast();
  const [viewDate, setViewDate] = useState(() => startOfMonth(new Date()));
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedBlockedDate, setSelectedBlockedDate] = useState<string | null>(null);
  const [blockToDelete, setBlockToDelete] = useState<AdminBlockedDate | null>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const monthParam = format(viewDate, "yyyy-MM");
  const {
    data: calendar,
    isFetching: isCalendarFetching,
    isError: isCalendarError,
    error: calendarError,
    refetch: refetchCalendar,
  } = useGetCalendar(monthParam);
  const {
    data: blockedDates,
    isFetching: areBlockedDatesFetching,
    isError: areBlockedDatesError,
    error: blockedDatesError,
    refetch: refetchBlockedDates,
  } = useQuery({
    queryKey: ["admin", "blocked-dates"],
    queryFn: adminBookingService.getAllBlockedDates,
  });

  const createBlockedDateMutation = useMutation({
    mutationFn: adminBookingService.createBlockedDates,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["calendar"] }),
        queryClient.invalidateQueries({ queryKey: ["admin", "blocked-dates"] }),
      ]);
      setIsCreateModalOpen(false);
      setStartDate("");
      setEndDate("");
      setReason("");
      setFormError(null);
      toast({
        title: "Dates blocked",
        description: "The calendar has been updated.",
        variant: "success",
      });
    },
    onError: (error) => {
      setFormError(getErrorMessage(error));
    },
  });

  const deleteBlockedDateMutation = useMutation({
    mutationFn: adminBookingService.deleteBlockedDate,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["calendar"] }),
        queryClient.invalidateQueries({ queryKey: ["admin", "blocked-dates"] }),
      ]);
      setSelectedBlockedDate(null);
      setBlockToDelete(null);
      toast({
        title: "Blocked period removed",
        description: "The calendar has been updated.",
        variant: "success",
      });
    },
    onError: (error) => {
      toast({
        title: "Unable to remove blocked period",
        description: getErrorMessage(error),
        variant: "error",
      });
    },
  });

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDayIndex = getDay(startOfMonth(viewDate));
  const daysInMonth = getDaysInMonth(viewDate);
  const statusByDate = useMemo(
    () => new Map(calendar?.days.map((day) => [day.date, day.status]) ?? []),
    [calendar],
  );
  const blockedDatesForSelectedDay = useMemo(
    () =>
      (blockedDates ?? []).filter((block) => {
        const start = getDateKey(block.startDate);
        const end = getDateKey(block.endDate);
        return selectedBlockedDate !== null &&
          selectedBlockedDate >= start &&
          selectedBlockedDate < end;
      }),
    [blockedDates, selectedBlockedDate],
  );
  const monthStart = `${monthParam}-01`;
  const monthEnd = format(addMonths(viewDate, 1), "yyyy-MM-dd");
  const blockedDatesForMonth = useMemo(
    () =>
      (blockedDates ?? []).filter((block) => {
        const start = getDateKey(block.startDate);
        const end = getDateKey(block.endDate);
        return start < monthEnd && end > monthStart;
      }),
    [blockedDates, monthEnd, monthStart],
  );

  const getBlocksForDate = (date: string) =>
    (blockedDates ?? []).filter((block) => {
      const start = getDateKey(block.startDate);
      const end = getDateKey(block.endDate);
      return date >= start && date < end;
    });

  const closeCreateModal = () => {
    if (createBlockedDateMutation.isPending) return;
    setIsCreateModalOpen(false);
    setFormError(null);
  };

  const handleCreateBlockedDates = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    if (!startDate || !endDate || endDate <= startDate) {
      setFormError("Choose an end date later than the start date.");
      return;
    }

    createBlockedDateMutation.mutate({
      startDate,
      endDate,
      ...(reason.trim() ? { reason: reason.trim() } : {}),
    });
  };

  const renderCalendarDay = (dayNumber: number) => {
    const date = format(new Date(year, month, dayNumber), "yyyy-MM-dd");
    const status = statusByDate.get(date);
    const blocks = getBlocksForDate(date);
    const isBlocked = blocks.length > 0 || status === "blocked";
    const isReserved = status === "reserved";
    const isPending = status === "pending";
    const dayClass = `relative h-11 sm:h-14 rounded-xl border flex flex-col items-center justify-center text-xs sm:text-sm font-medium transition-all ${
      isBlocked
        ? "border-stone-300 bg-stone-200 text-stone-800"
        : isReserved
          ? "border-reserved-border bg-reserved text-reserved-foreground"
          : isPending
            ? "border-pending-border bg-pending text-pending-foreground"
            : "border-border/70 bg-background text-foreground"
    }`;

    if (isBlocked) {
      return (
        <button
          key={dayNumber}
          type="button"
          className={`${dayClass} w-full hover:ring-1 hover:ring-stone-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-wait disabled:opacity-70`}
          onClick={() => setSelectedBlockedDate(date)}
          disabled={areBlockedDatesFetching || areBlockedDatesError}
          aria-label={`Blocked date ${format(new Date(year, month, dayNumber), "MMMM d, yyyy")}. Click to manage blocked periods.`}
          title={blocks.length > 0 ? "Click to view or remove this blocked period" : "Blocked"}
        >
          <span>{dayNumber}</span>
          <span className="mt-0.5 hidden text-[9px] uppercase tracking-tighter opacity-80 sm:block">
            Blocked
          </span>
        </button>
      );
    }

    return (
      <div
        key={dayNumber}
        className={`${dayClass} ${status ? "" : "border-dashed text-muted-foreground"}`}
        aria-label={`${format(new Date(year, month, dayNumber), "MMMM d, yyyy")}: ${status ?? "availability loading"}`}
      >
        <span>{dayNumber}</span>
        {isReserved && (
          <span className="mt-0.5 hidden text-[9px] uppercase tracking-tighter opacity-80 sm:block">
            Reserved
          </span>
        )}
        {isPending && (
          <span className="mt-0.5 hidden text-[9px] uppercase tracking-tighter opacity-80 sm:block">
            Pending
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="container-page space-y-8 py-8 sm:py-12">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-serif text-2xl font-bold text-foreground sm:text-3xl lg:text-4xl">
            Calendar &amp; Maintenance
          </h1>
          <p className="text-xs text-muted-foreground sm:text-sm">
            Monitor reservations and manage blocked dates for cleaning or repairs.
          </p>
        </div>
        <Button
          type="button"
          onClick={() => {
            setFormError(null);
            setIsCreateModalOpen(true);
          }}
          className="bg-primary text-xs text-primary-foreground shadow-sm hover:bg-primary-hover sm:text-sm"
        >
          <Ban className="mr-1.5 h-4 w-4" />
          Block Dates
        </Button>
      </div>

      {isCalendarError && (
        <div className="flex flex-wrap items-center gap-3 text-sm text-destructive" role="alert">
          <span>{getErrorMessage(calendarError)}</span>
          <Button type="button" variant="outline" size="sm" onClick={() => refetchCalendar()}>
            Try again
          </Button>
        </div>
      )}
      {areBlockedDatesError && (
        <div className="flex flex-wrap items-center gap-3 text-sm text-destructive" role="alert">
          <span>{getErrorMessage(blockedDatesError)}</span>
          <Button type="button" variant="outline" size="sm" onClick={() => refetchBlockedDates()}>
            Try again
          </Button>
        </div>
      )}

      {(isCalendarFetching || areBlockedDatesFetching) ? (
        <AdminCalendarSkeleton />
      ) : (
      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
        <div className="space-y-6 rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-8 lg:col-span-8">
          <div className="flex flex-wrap items-center gap-4 text-xs">
            <div className="flex items-center gap-2">
              <span className="h-3.5 w-3.5 rounded-full border border-border bg-card" />
              <span className="text-muted-foreground">Open</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-3.5 w-3.5 rounded-full border border-pending bg-pending" />
              <span className="text-muted-foreground">Pending Review</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-3.5 w-3.5 rounded-full border border-reserved bg-reserved" />
              <span className="text-muted-foreground">Reserved Date</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-3.5 w-3.5 rounded-full border border-border bg-muted" />
              <span className="text-muted-foreground">Blocked</span>
            </div>
          </div>

          <div className="flex items-center justify-between border-y border-border py-3">
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              onClick={() => setViewDate((date) => addMonths(date, -1))}
              aria-label="Previous month"
              className="text-muted-foreground hover:text-foreground"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h2 className="font-serif text-lg font-bold text-foreground sm:text-xl">
              {format(viewDate, "MMMM yyyy")}
            </h2>
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              onClick={() => setViewDate((date) => addMonths(date, 1))}
              aria-label="Next month"
              className="text-muted-foreground hover:text-foreground"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-muted-foreground sm:gap-2">
            {WEEKDAYS.map((weekday) => (
              <span key={weekday}>{weekday.slice(0, 2)}</span>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {Array.from({ length: firstDayIndex }, (_, index) => (
              <div key={`blank-${index}`} className="h-11 opacity-20 sm:h-14" />
            ))}
            {Array.from({ length: daysInMonth }, (_, index) =>
              renderCalendarDay(index + 1),
            )}
          </div>

          <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-muted/40 p-3 text-xs text-muted-foreground">
            <Ban className="h-4 w-4 shrink-0 text-primary" />
            <span>
              Click a blocked date to review or remove its blocked period. The start date is included
              and the end date is excluded.
            </span>
          </div>
        </div>

        <aside className="lg:col-span-4">
          <div className="rounded-2xl border border-border bg-card shadow-sm">
            <div className="border-b border-border p-5 sm:p-6">
              <h2 className="font-serif text-base font-bold text-foreground">
                {format(viewDate, "MMMM")} Overview
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Availability and maintenance for the selected month.
              </p>
            </div>
            <div className="space-y-4 p-5 text-xs sm:p-6 sm:text-sm">
              {calendar && (
                <>
                  <div className="flex items-center justify-between border-b border-border/60 pb-3">
                    <span className="text-muted-foreground">Open days</span>
                    <span className="font-semibold text-foreground">
                      {calendar.summary.openDays}
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-b border-border/60 pb-3">
                    <span className="text-muted-foreground">Pending review</span>
                    <span className="font-semibold text-foreground">
                      {calendar.summary.pendingDays}
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-b border-border/60 pb-3">
                    <span className="text-muted-foreground">Reserved days</span>
                    <span className="font-semibold text-foreground">
                      {calendar.summary.reservedDays}
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-b border-border/60 pb-3">
                    <span className="text-muted-foreground">Blocked days</span>
                    <span className="font-semibold text-foreground">
                      {calendar.summary.blockedDays}
                    </span>
                  </div>
                </>
              )}

              <div className="space-y-3 pt-1">
                <h3 className="font-semibold text-foreground">Blocked periods this month</h3>
                {areBlockedDatesError ? (
                  <p className="text-xs text-muted-foreground">
                    Blocked periods are unavailable.
                  </p>
                ) : blockedDatesForMonth.length === 0 ? (
                  <p className="text-xs text-muted-foreground">
                    There are no blocked periods this month.
                  </p>
                ) : (
                  <ul className="max-h-64 space-y-3 overflow-y-auto">
                    {blockedDatesForMonth.map((block) => (
                      <li key={block.id} className="rounded-lg border border-border/70 p-3">
                        <p className="font-medium text-foreground">
                          {formatBlockRange(block)}
                        </p>
                        <p className="mt-1 break-words text-xs text-muted-foreground">
                          {block.reason?.trim() || "No reason provided"}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </aside>
      </div>
      )}

      {isCreateModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeCreateModal();
          }}
        >
          <form
            className="w-full max-w-md space-y-5 rounded-2xl border border-border bg-card p-6 shadow-2xl"
            onSubmit={handleCreateBlockedDates}
            role="dialog"
            aria-modal="true"
            aria-labelledby="block-dates-title"
          >
            <div className="border-b border-border pb-3">
              <h2 id="block-dates-title" className="font-serif text-lg font-bold text-foreground">
                Block Dates
              </h2>
              <p className="text-xs text-muted-foreground">
                The start date is included. The end date is checkout and is not blocked.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label htmlFor="blocked-start-date" className="mb-1 block text-xs font-semibold">
                  Start date
                </label>
                <Input
                  id="blocked-start-date"
                  type="date"
                  required
                  value={startDate}
                  onChange={(event) => setStartDate(event.target.value)}
                  disabled={createBlockedDateMutation.isPending}
                />
              </div>
              <div>
                <label htmlFor="blocked-end-date" className="mb-1 block text-xs font-semibold">
                  End date (excluded)
                </label>
                <Input
                  id="blocked-end-date"
                  type="date"
                  required
                  min={startDate || undefined}
                  value={endDate}
                  onChange={(event) => setEndDate(event.target.value)}
                  disabled={createBlockedDateMutation.isPending}
                />
              </div>
            </div>

            <div>
              <label htmlFor="blocked-reason" className="mb-1 block text-xs font-semibold">
                Reason (optional)
              </label>
              <Textarea
                id="blocked-reason"
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                placeholder="e.g. Maintenance or deep cleaning"
                maxLength={255}
                rows={3}
                disabled={createBlockedDateMutation.isPending}
              />
            </div>

            {formError && (
              <p className="flex items-center gap-1 text-xs text-destructive" role="alert">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                {formError}
              </p>
            )}

            <div className="flex justify-end gap-2 border-t border-border pt-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={closeCreateModal}
                disabled={createBlockedDateMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={createBlockedDateMutation.isPending}
                className="bg-primary text-primary-foreground hover:bg-primary-hover"
              >
                {createBlockedDateMutation.isPending ? "Saving..." : "Block Dates"}
              </Button>
            </div>
          </form>
        </div>
      )}

      {selectedBlockedDate && !blockToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div
            className="w-full max-w-md space-y-4 rounded-2xl border border-border bg-card p-6 shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="blocked-day-title"
          >
            <div className="border-b border-border pb-3">
              <h2 id="blocked-day-title" className="font-serif text-lg font-bold text-foreground">
                Blocked periods on {formatDate(selectedBlockedDate)}
              </h2>
              <p className="text-xs text-muted-foreground">
                Removing a period unblocks its full date range.
              </p>
            </div>

            {blockedDatesForSelectedDay.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                This date is not covered by a removable blocked period.
              </p>
            ) : (
              <ul className="space-y-3">
                {blockedDatesForSelectedDay.map((block) => (
                  <li
                    key={block.id}
                    className="flex flex-col justify-between gap-3 rounded-lg border border-border p-3 sm:flex-row sm:items-center"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium">{formatBlockRange(block)}</p>
                      <p className="break-words text-xs text-muted-foreground">
                        {block.reason?.trim() || "No reason provided"}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="shrink-0 text-destructive"
                      onClick={() => setBlockToDelete(block)}
                      disabled={deleteBlockedDateMutation.isPending}
                    >
                      <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                      Remove
                    </Button>
                  </li>
                ))}
              </ul>
            )}

            <div className="flex justify-end border-t border-border pt-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setSelectedBlockedDate(null)}
                disabled={deleteBlockedDateMutation.isPending}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {blockToDelete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4">
          <div
            className="w-full max-w-md space-y-5 rounded-2xl border border-border bg-card p-6 shadow-2xl"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirm-delete-block-title"
            aria-describedby="confirm-delete-block-description"
          >
            <div className="border-b border-border pb-3">
              <h2
                id="confirm-delete-block-title"
                className="font-serif text-lg font-bold text-foreground"
              >
                Remove blocked period?
              </h2>
              <p
                id="confirm-delete-block-description"
                className="mt-1 text-sm text-muted-foreground"
              >
                This removes the entire period, not only the selected day.
              </p>
            </div>
            <div className="space-y-1 rounded-lg border border-border bg-muted/30 p-3">
              <p className="text-sm font-medium text-foreground">
                {formatBlockRange(blockToDelete)}
              </p>
              <p className="break-words text-xs text-muted-foreground">
                {blockToDelete.reason?.trim() || "No reason provided"}
              </p>
            </div>
            <div className="flex justify-end gap-2 border-t border-border pt-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setBlockToDelete(null)}
                disabled={deleteBlockedDateMutation.isPending}
              >
                Keep blocked
              </Button>
              <Button
                type="button"
                size="sm"
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={() => deleteBlockedDateMutation.mutate(blockToDelete.id)}
                disabled={deleteBlockedDateMutation.isPending}
              >
                <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                {deleteBlockedDateMutation.isPending ? "Removing..." : "Remove period"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCalendarPage;

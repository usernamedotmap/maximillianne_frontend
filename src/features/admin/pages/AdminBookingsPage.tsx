import { useState } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Eye,
  Search,
  Users,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatGuestName } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  type AdminBookingListItem,
  type AdminBookingStatus,
} from "@/service/admin-booking";
import { useAdminBookings } from "../hooks/useAdminBookings";

const BOOKING_STATUSES: AdminBookingStatus[] = [
  "pending",
  "approved",
  "rejected",
  "cancelled",
  "expired",
];
const PAGE_SIZE = 10;

const STATUS_CLASSES: Record<AdminBookingStatus, string> = {
  pending:
    "border-[var(--pending-border)] bg-[var(--pending)] text-[var(--pending-foreground)]",
  approved:
    "border-transparent bg-[var(--confirmed)] text-[var(--confirmed-foreground)]",
  rejected:
    "border-[var(--reserved-border)] bg-[var(--reserved)] text-[var(--reserved-foreground)]",
  cancelled:
    "border-[var(--reserved-border)] bg-[var(--reserved)] text-[var(--reserved-foreground)]",
  expired: "border-border bg-[var(--blocked)] text-[var(--blocked-foreground)]",
};

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value.slice(0, 10)}T00:00:00.000Z`));

const countNights = (checkIn: string, checkOut: string) => {
  const toUtcDay = (value: string) => {
    const [year, month, day] = value.slice(0, 10).split("-").map(Number);
    return Date.UTC(year, month - 1, day);
  };

  return Math.round((toUtcDay(checkOut) - toUtcDay(checkIn)) / 86_400_000);
};

const formatAmount = (value: number | string) =>
  `₱${Number(value).toLocaleString("en-PH")}`;

const formatStatus = (status: AdminBookingStatus) =>
  status.replace(/\b\w/g, (letter) => letter.toUpperCase());

const matchesSearch = (booking: AdminBookingListItem, search: string) => {
  const query = search.trim().toLocaleLowerCase();
  return (
    !query ||
    booking.guest.fullName.toLocaleLowerCase().includes(query) ||
    booking.guest.phone.toLocaleLowerCase().includes(query)
  );
};

const AdminBookingsPage = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<AdminBookingStatus>("pending");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const { data, isPending, isError, error, refetch } = useAdminBookings(
    status,
    page,
    PAGE_SIZE,
  );
  const bookings = (data?.bookings ?? []).filter((booking) =>
    matchesSearch(booking, search),
  );
  const totalPages = data?.pagination.totalPage ?? 1;

  const openBooking = (bookingId: string) =>
    navigate(`/admin/bookings/${bookingId}`);

  const renderStatus = (bookingStatus: AdminBookingStatus) => (
    <Badge
      variant="outline"
      className={`h-6 px-2 text-[10px] font-semibold ${STATUS_CLASSES[bookingStatus]}`}
    >
      {formatStatus(bookingStatus)}
    </Badge>
  );

  const renderBookingDetails = (booking: AdminBookingListItem) => (
    <>
      <p className="font-medium text-foreground">
        {formatDate(booking.checkIn)} – {formatDate(booking.checkOut)}
      </p>
      <p className="mt-1 text-[11px] text-muted-foreground">
        {countNights(booking.checkIn, booking.checkOut)} nights
      </p>
    </>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="font-serif text-2xl font-bold text-foreground sm:text-3xl">
            Bookings
          </h1>
          <p className="text-xs text-muted-foreground sm:text-sm">
            Review reservations by status and view guest booking details.
          </p>
        </div>
        <div className="relative w-full sm:w-72">
          <Input
            aria-label="Search bookings on this page"
            placeholder="Search this page by guest or phone..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="pl-9 text-xs"
          />
          <Search
            aria-hidden="true"
            className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground"
          />
        </div>
      </div>

      <div
        role="group"
        aria-label="Filter bookings by status"
        className="flex gap-2 overflow-x-auto border-b border-border pb-3"
      >
        {BOOKING_STATUSES.map((bookingStatus) => (
          <Button
            key={bookingStatus}
            type="button"
            size="sm"
            variant={status === bookingStatus ? "default" : "outline"}
            aria-pressed={status === bookingStatus}
            onClick={() => {
              setStatus(bookingStatus);
              setPage(1);
            }}
            className="h-8 px-3 text-xs"
          >
            {formatStatus(bookingStatus)}
          </Button>
        ))}
      </div>

      {isError ? (
        <div
          role="alert"
          className="rounded-xl border border-destructive/30 bg-card p-6 text-center"
        >
          <p className="text-sm font-medium text-foreground">
            Unable to load {status} bookings.
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {error instanceof Error ? error.message : "Please try again."}
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={() => void refetch()}
          >
            Try again
          </Button>
        </div>
      ) : isPending ? (
        <div
          role="status"
          className="rounded-xl border border-border bg-card p-10 text-center text-sm text-muted-foreground"
        >
          Loading {status} bookings...
        </div>
      ) : bookings.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-10 text-center">
          <p className="text-sm font-medium text-foreground">
            {search
              ? "No bookings on this page match your search."
              : `No ${status} bookings found.`}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {search
              ? "Try another guest name or phone number."
              : "Bookings with this status will appear here."}
          </p>
        </div>
      ) : (
        <>
          <div className="hidden overflow-hidden rounded-xl border border-border bg-card shadow-card md:block">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                  <TableHead>Booking ID</TableHead>
                  <TableHead>Guest</TableHead>
                  <TableHead>Dates</TableHead>
                  <TableHead>Guests</TableHead>
                  <TableHead>Total amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell className="font-mono text-xs font-semibold text-primary">
                      #{booking.id.slice(0, 8)}
                    </TableCell>
                    <TableCell>
                      <p className="text-xs font-semibold text-foreground">
                        {formatGuestName(booking.guest.fullName)}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {booking.guest.phone}
                      </p>
                    </TableCell>
                    <TableCell className="text-xs">
                      {renderBookingDetails(booking)}
                    </TableCell>
                    <TableCell className="text-xs">
                      {booking.guestCount}
                    </TableCell>
                    <TableCell className="text-xs font-semibold">
                      {formatAmount(booking.totalAmount)}
                    </TableCell>
                    <TableCell>{renderStatus(booking.status)}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => openBooking(booking.id)}
                        className="text-xs"
                      >
                        <Eye aria-hidden="true" />
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="space-y-3 md:hidden">
            {bookings.map((booking) => (
              <article
                key={booking.id}
                className="space-y-4 rounded-xl border border-border bg-card p-4 shadow-card"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-mono text-xs font-semibold text-primary">
                      #{booking.id.slice(0, 8)}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-foreground">
                      {formatGuestName(booking.guest.fullName)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {booking.guest.phone}
                    </p>
                  </div>
                  {renderStatus(booking.status)}
                </div>

                <div className="grid grid-cols-2 gap-3 border-y border-border py-3 text-xs">
                  <div className="flex gap-2">
                    <CalendarDays
                      aria-hidden="true"
                      className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground"
                    />
                    <div>{renderBookingDetails(booking)}</div>
                  </div>
                  <div className="flex gap-2">
                    <Users
                      aria-hidden="true"
                      className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground"
                    />
                    <p>
                      {booking.guestCount}{" "}
                      {booking.guestCount === 1 ? "guest" : "guests"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[11px] text-muted-foreground">
                      Total amount
                    </p>
                    <p className="text-sm font-semibold text-foreground">
                      {formatAmount(booking.totalAmount)}
                    </p>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => openBooking(booking.id)}
                    className="text-xs"
                  >
                    <Eye aria-hidden="true" />
                    View
                  </Button>
                </div>
              </article>
            ))}
          </div>
        </>
      )}

      {!isPending && !isError && data && data.pagination.total > 0 && (
        <div className="flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">
            Page {page} of {totalPages} · {data.pagination.total}{" "}
            {status} {data.pagination.total === 1 ? "booking" : "bookings"}
          </p>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((currentPage) => currentPage - 1)}
            >
              <ChevronLeft aria-hidden="true" />
              Previous
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((currentPage) => currentPage + 1)}
            >
              Next
              <ChevronRight aria-hidden="true" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBookingsPage;

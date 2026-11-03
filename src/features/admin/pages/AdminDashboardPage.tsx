import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarCheck2, Clock, PhilippinePeso } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
  useAdminDashboardSummary,
  useAdminPendingBookings,
} from "../hooks/useAdminBookings";

const MOBILE_PAGE_SIZE_OPTIONS: number[] = [5, 10, 15];
const DESKTOP_PAGE_SIZE_OPTIONS: number[] = [10, 25, 50];

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

const formatRevenueMonth = (value?: string) =>
  value
    ? new Intl.DateTimeFormat("en-PH", {
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    }).format(new Date(`${value}-01T00:00:00.000Z`))
    : "this month";

const formatSubmittedAt = (value: string) =>
  new Intl.DateTimeFormat("en-PH", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));

const getDownpaymentAmount = (payments: { type: string; amount: number | string }[]) =>
  payments
    .filter((payment) => payment.type === "downpayment")
    .reduce((total, payment) => total + Number(payment.amount), 0);

const getVisiblePages = (currentPage: number, totalPages: number) => {
  const pages = [...new Set([1, currentPage - 1, currentPage, currentPage + 1, totalPages])]
    .filter((pageNumber) => pageNumber >= 1 && pageNumber <= totalPages)
    .sort((a, b) => a - b);

  return pages.flatMap((pageNumber, index) => {
    if (index > 0 && pageNumber - pages[index - 1] > 1) {
      return ["ellipsis", pageNumber] as const;
    }
    return [pageNumber] as const;
  });
};

const Skeleton = ({ className }: { className: string }) => (
  <span
    aria-hidden="true"
    className={`inline-block animate-pulse rounded-md bg-muted ${className}`}
  />
);

const AdminDashboardPage = () => {
  const [isMobile, setIsMobile] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(max-width: 767px)").matches,
  );
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(isMobile ? 5 : 10);
  const navigate = useNavigate();
  const {
    data: summary,
    isPending: isSummaryLoading,
    isError: isSummaryError,
    error: summaryError,
  } = useAdminDashboardSummary();


  const {
    data: pendingBookingResponse,
    isPending: isPendingBookingsLoading,
    isError: isPendingBookingsError,
    error: pendingBookingsError,
  } = useAdminPendingBookings(page, pageSize);
  const pendingBookings = pendingBookingResponse?.bookings ?? [];
  const pagination = pendingBookingResponse?.pagination;
  const pageSizeOptions = isMobile
    ? MOBILE_PAGE_SIZE_OPTIONS
    : DESKTOP_PAGE_SIZE_OPTIONS;
  const totalPages = pagination?.totalPage ?? 1;
  const totalBookings = pagination?.total ?? 0;
  const firstItem = totalBookings === 0 ? 0 : (page - 1) * pageSize + 1;
  const lastItem = Math.min(page * pageSize, totalBookings);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 767px)");
    const updateViewport = () => setIsMobile(mediaQuery.matches);

    mediaQuery.addEventListener("change", updateViewport);
    return () => mediaQuery.removeEventListener("change", updateViewport);
  }, []);

  useEffect(() => {
    const availablePageSizes = isMobile
      ? MOBILE_PAGE_SIZE_OPTIONS
      : DESKTOP_PAGE_SIZE_OPTIONS;
    if (!availablePageSizes.includes(pageSize)) {
      setPageSize(isMobile ? 5 : 10);
      setPage(1);
    }
  }, [isMobile, pageSize]);

  useEffect(() => {
    if (pagination && page > pagination.totalPage) {
      setPage(pagination.totalPage);
    }
  }, [page, pagination?.totalPage]);

  const handlePageSizeChange = (nextPageSize: number) => {
    setPageSize(nextPageSize);
    setPage(1);
  };


  return (
    <div className="space-y-8">
      {/* welcome heading */}
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-serif fond-bold text-foreground">
          Welcome back {":>"}
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Here is what is happening across Maximilliane's Haven today.
        </p>
      </div>


      {/* metrics card */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        {/* metrics pending */}
        <Card className="border border-border/80 shadow-xs rounded-xl bg-card">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-muted-foreground tracking-wider uppercase">
                Pending Requests
              </span>
              <p className="text-2xl sm:text-3xl font-serif font-bold text-foreground">
                {isSummaryLoading ? (
                  <Skeleton className="mt-2 h-8 w-16" />
                ) : isSummaryError ? (
                  <span className="text-sm text-destructive" role="alert">Unavailable</span>
                ) : (
                  summary?.pendingRequests ?? 0
                )}
              </p>
              <p className="text-[11px] text-amber-700 font-medium">Requires Verification</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-pending flex items-center justify-center text-pending-foreground">
              <Clock className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        {/* metrics upcomeing booking */}
        <Card className="border border-border/80 shadow-xs rounded-xl bg-card">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-muted-foreground tracking-wider uppercase">
                Upcoming Bookings
              </span>
              <p className="text-2xl sm:text-3xl font-serif font-bold text-foreground">
                {isSummaryLoading ? (
                  <Skeleton className="mt-2 h-8 w-16" />
                ) : isSummaryError ? (
                  <span className="text-sm text-destructive" role="alert">Unavailable</span>
                ) : (
                  summary?.upcomingBookings ?? 0
                )}
              </p>
              <p className="text-[11px] text-emerald-700 font-medium">Confirmed & ready</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-confirmed flex items-center justify-center text-confirmed-foreground">
              <CalendarCheck2 className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        {/* metrics revnue */}
        <Card className="border border-border/80 shadow-xs rounded-xl bg-card">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-muted-foreground tracking-wider uppercase">
                This Month's Gross Revenue
              </span>
              <p className="text-2xl sm:text-3xl font-serif font-bold text-foreground">
                {isSummaryLoading ? (
                  <Skeleton className="mt-2 h-8 w-28" />
                ) : isSummaryError ? (
                  <span className="text-sm text-destructive" role="alert">Unavailable</span>
                ) : (
                  `₱${(summary?.monthlyGrossRevenue ?? 0).toLocaleString("en-PH")}`
                )}
              </p>
              <p className="text-[11px] text-muted-foreground">
                Approved stays checking in {formatRevenueMonth(summary?.revenueMonth)}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center text-primary">
              <PhilippinePeso className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>
      </div>
      {isSummaryError && (
        <p className="text-xs text-destructive" role="alert">
          {summaryError instanceof Error
            ? summaryError.message
            : "Unable to load dashboard metrics. Please try again."}
        </p>
      )}

      {/* pending request table */}
      <div className="bg-card border-border rounded-xl shadow-xs overflow-hidden">
        <div className="p-5 border-b border-border flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-serif fond-bold text-foreground">Pending Requests</h2>
            <p className="text-xs text-muted-foreground">
              Review guest GCash transfer screenshots and approve or reject staycations.
            </p>
          </div>
          <Badge variant="outline" className="text-xs">
            {isPendingBookingsLoading ? (
              <Skeleton className="h-4 w-20" />
            ) : (
              `${pagination?.total ?? 0} awaiting action`
            )}
          </Badge>
        </div>
        {isPendingBookingsLoading ? (
          <div aria-label="Loading pending requests" className="space-y-3 p-4">
            <div className="hidden space-y-3 md:block">
              {Array.from({ length: 5 }, (_, index) => (
                <div
                  key={`desktop-skeleton-${index}`}
                  className="grid grid-cols-8 items-center gap-4 border-b border-border/60 px-3 py-4"
                >
                  <Skeleton className="h-8 w-28" />
                  <Skeleton className="h-8 w-32" />
                  <Skeleton className="h-5 w-12" />
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-6 w-24" />
                  <Skeleton className="h-5 w-28" />
                  <Skeleton className="ml-auto h-7 w-16" />
                </div>
              ))}
            </div>
            <div className="space-y-3 md:hidden">
              {Array.from({ length: 3 }, (_, index) => (
                <div
                  key={`mobile-skeleton-${index}`}
                  className="space-y-4 rounded-xl border border-border p-4"
                >
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-10 w-36" />
                    <Skeleton className="h-6 w-16" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                  <div className="flex items-center justify-between border-t border-border pt-3">
                    <Skeleton className="h-5 w-28" />
                    <Skeleton className="h-7 w-16" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : isPendingBookingsError ? (
          <div role="alert" className="p-8 text-center text-xs text-destructive">
            {pendingBookingsError instanceof Error
              ? pendingBookingsError.message
              : "Unable to load pending requests. Please try again."}
          </div>
        ) : (
          <>
            {pendingBookings.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted-foreground">
                No pending requests at this time. All caught up!
              </div>
            ) : (
              <>
                <div className="hidden md:block">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Guest</TableHead>
                        <TableHead>Dates</TableHead>
                        <TableHead>Guests</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Downpayment</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Submitted</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingBookings.map((b) => (
                        <TableRow key={b.id} className="hover:bg-muted/40 transition-colors">
                          <TableCell>
                            <div>
                              <p className="font-semibold text-foreground text-xs sm:text-sm">
                                {formatGuestName(b.guest.fullName)}
                              </p>
                              <p className="text-[11px] text-muted-foreground">
                                {b.guest.phone}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell className="text-xs">
                            <p className="font-medium text-foreground">
                              {formatDate(b.checkIn)} to {formatDate(b.checkOut)}
                            </p>
                            <p className="text-[10px] text-muted-foreground">
                              {countNights(b.checkIn, b.checkOut)} nights
                            </p>
                          </TableCell>
                          <TableCell className="text-xs">{b.guestCount} Guests</TableCell>
                          <TableCell className="font-semibold text-xs text-foreground">
                            {formatAmount(b.totalAmount)}
                          </TableCell>
                          <TableCell className="font-semibold text-xs text-primary">
                            {formatAmount(getDownpaymentAmount(b.payment))}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className="border-amber-200 bg-amber-50 text-[10px] font-semibold text-amber-800"
                            >
                              Pending verification
                            </Badge>
                          </TableCell>
                          <TableCell className="text-[11px] text-muted-foreground">
                            {formatSubmittedAt(b.createdAt)}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              size="sm"
                              onClick={() => navigate(`/admin/bookings/${b.id}`)}
                              className="bg-primary hover:bg-primary-hover text-primary-foreground text-xs h-7 px-3"
                            >
                              Review
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <div className="space-y-3 p-4 md:hidden">
                  {pendingBookings.map((b) => (
                    <Card key={b.id} className="border border-border/80 shadow-xs">
                      <CardContent className="space-y-4 p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-semibold text-sm text-foreground">
                              {formatGuestName(b.guest.fullName)}
                            </p>
                            <p className="text-xs text-muted-foreground">{b.guest.phone}</p>
                          </div>
                          <Badge
                            variant="outline"
                            className="shrink-0 border-amber-200 bg-amber-50 text-[10px] font-semibold text-amber-800"
                          >
                            Pending
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div>
                            <p className="text-muted-foreground">Dates</p>
                            <p className="font-medium text-foreground">
                              {formatDate(b.checkIn)} – {formatDate(b.checkOut)}
                            </p>
                            <p className="text-[11px] text-muted-foreground">
                              {countNights(b.checkIn, b.checkOut)} nights
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Guests</p>
                            <p className="font-medium text-foreground">{b.guestCount}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Total</p>
                            <p className="font-semibold text-foreground">
                              {formatAmount(b.totalAmount)}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Downpayment</p>
                            <p className="font-semibold text-primary">
                              {formatAmount(getDownpaymentAmount(b.payment))}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between gap-3 border-t border-border pt-3">
                          <p className="text-[11px] text-muted-foreground">
                            Submitted {formatSubmittedAt(b.createdAt)}
                          </p>
                          <Button
                            size="sm"
                            onClick={() => navigate(`/admin/bookings/${b.id}`)}
                            className="text-xs"
                          >
                            Review
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            )}
            <div className="border-t border-border p-4">
              <div className="hidden items-center justify-between gap-4 md:flex">
                <div className="flex items-center gap-4">
                  <p className="text-xs text-muted-foreground">
                    Showing {firstItem}–{lastItem} of {totalBookings}
                  </p>
                  <label className="flex items-center gap-2 text-xs text-muted-foreground">
                    Rows per page
                    <select
                      aria-label="Rows per page"
                      className="h-8 rounded-md border border-input bg-background px-2 text-foreground"
                      value={pageSize}
                      onChange={(event) => handlePageSizeChange(Number(event.target.value))}
                    >
                      {pageSizeOptions.map((option) => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </label>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => setPage((currentPage) => currentPage - 1)}
                  >
                    Previous
                  </Button>
                  {getVisiblePages(page, totalPages).map((pageNumber, index) =>
                    pageNumber === "ellipsis" ? (
                      <span key={`ellipsis-${index}`} className="px-1 text-muted-foreground">
                        ...
                      </span>
                    ) : (
                      <Button
                        key={pageNumber}
                        variant={pageNumber === page ? "default" : "outline"}
                        size="sm"
                        aria-current={pageNumber === page ? "page" : undefined}
                        aria-label={`Go to page ${pageNumber}`}
                        onClick={() => setPage(pageNumber)}
                      >
                        {pageNumber}
                      </Button>
                    ),
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= totalPages}
                    onClick={() => setPage((currentPage) => currentPage + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
              <div className="flex flex-col gap-3 md:hidden">
                <p className="text-center text-xs text-muted-foreground">
                  Showing {firstItem}–{lastItem} of {totalBookings}
                </p>
                <div className="flex items-center justify-between gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => setPage((currentPage) => currentPage - 1)}
                  >
                    Previous
                  </Button>
                  <span className="text-xs text-muted-foreground">
                    Page {page} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= totalPages}
                    onClick={() => setPage((currentPage) => currentPage + 1)}
                  >
                    Next
                  </Button>
                </div>
                <label className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                  Rows per page
                  <select
                    aria-label="Rows per page"
                    className="h-8 rounded-md border border-input bg-background px-2 text-foreground"
                    value={pageSize}
                    onChange={(event) => handlePageSizeChange(Number(event.target.value))}
                  >
                    {pageSizeOptions.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </label>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default AdminDashboardPage

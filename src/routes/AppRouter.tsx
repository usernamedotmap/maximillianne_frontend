import AvailabilityPage from "@/features/booking/pages/AvailabilityPage";
import BookingRequestPage from "@/features/booking/pages/BookingRequestPage";
import BookingPaymentPage from "@/features/booking/pages/BookingPaymentPage";
import HomePage from "@/features/booking/pages/HomePage";
import PublicLayout from "@/layouts/PublicLayout.tsx";
import { Navigate, Route, Routes, useParams } from "react-router-dom";
import AdminLoginPage from "@/features/admin/pages/AdminLoginPage";
import AdminDashboardPage from "@/features/admin/pages/AdminDashboardPage";
import { RequireAdmin } from "@/features/admin/components/RequireAdmin";
import AdminLayout from "@/layouts/AdminLayout";
import BookingDetailsPage from "@/features/admin/pages/BookingDetailsPage";
import AdminBookingsPage from "@/features/admin/pages/AdminBookingsPage";
import AdminCalendarPage from "@/features/admin/pages/AdminCalendarPage";


export function AppRoutes() {
    return (
        <Routes>
            <Route element={<PublicLayout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/availability" element={<AvailabilityPage />} />
                <Route path="/booking/request" element={<BookingRequestPage />} />
                <Route path="/booking/:id" element={<BookingPaymentPage />} />
                <Route
                    path="/booking/:id/payment"
                    element={<LegacyBookingPaymentRedirect />}
                />
            </Route>

            {/* admin authentication */}
            <Route path="/admin/login" element={<AdminLoginPage />} />

            {/* protected route */}
            <Route element={<RequireAdmin />}>
                <Route path="/admin" element={<AdminLayout />}>
                    <Route path="dashboard" element={<AdminDashboardPage />} />
                    <Route path="bookings" element={<AdminBookingsPage />} />
                    <Route path="bookings/:id" element={<BookingDetailsPage />} />
                    <Route path="calendar" element={<AdminCalendarPage />} />
                </Route>
            </Route>



            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>


    )
}

function LegacyBookingPaymentRedirect() {
    const { id = "" } = useParams();
    return <Navigate to={`/booking/${encodeURIComponent(id)}`} replace />;
}
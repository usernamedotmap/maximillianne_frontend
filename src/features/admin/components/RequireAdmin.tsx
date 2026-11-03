import { Navigate, Outlet, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { ApiError } from "@/lib/axios";
import { useCurrentAdmin } from "../hooks/useAuth";

export function RequireAdmin() {
  const location = useLocation();
  const { data: user, isPending, isError, error, refetch } = useCurrentAdmin();

  if (isPending) {
    return (
      <div className="container-page flex min-h-64 items-center justify-center gap-2">
        <Spinner />
        <span className="text-sm text-muted-foreground">Checking session...</span>
      </div>
    );
  }

  if (isError && error instanceof ApiError && error.status === 401) {
    return (
      <Navigate
        to="/admin/login"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  if (isError) {
    return (
      <div className="container-page space-y-3 py-12">
        <p className="text-sm text-destructive" role="alert">
          {error instanceof Error
            ? error.message
            : "Unable to verify your admin session."}
        </p>
        <Button type="button" variant="outline" onClick={() => refetch()}>
          Try again
        </Button>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  return <Outlet />;
}

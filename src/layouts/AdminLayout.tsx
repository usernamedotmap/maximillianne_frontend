

import { BookmarkCheck, Calendar, ExternalLink, LayoutDashboard, LogOut, Users } from 'lucide-react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import Logo from "@/assets/logo.png";
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toaster';
import { useLogout } from '@/features/admin/hooks/useAuth';

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();
  const logout = useLogout();

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSuccess: () => {
        toast({
          title: "Signed out",
          description: "Your admin session has ended.",
          variant: "success",
        });
        navigate("/admin/login", { replace: true });
      },
      onError: (error) => {
        toast({
          title: "Unable to sign out",
          description: error instanceof Error ? error.message : "Please try again.",
          variant: "error",
        });
      },
    });
  };

  const navItems = [
    { label: "Dashboard", path: "dashboard", icon: LayoutDashboard },
    { label: "Bookings", path: "bookings", icon: BookmarkCheck },
    { label: "Calendar", path: "calendar", icon: Calendar },
  ];
  return (
    <div className='min-h-screen flex flex-col bg-[#fbf9f6] text-foreground font-sans antialiased'>
      {/* top admin navigate ion bard */}
      <header className='sticky top-0 z-40 w-full border-b border-border/80 bg-card/98 backdrop-blur-md'>
        <div className="container-page flex h-16 items-center justify-between">
          {/* brand and badge */}
          <div className="flex items-center gap-3">
            <Link
              to="/admin/dashboard"
              className="flex items-center gap-2.5"
            >
              <img
                src={Logo}
                alt="Logo"
                className='w-9 h-9 rounded-full object-cover border border-border'
              />
              <span className="font-serif text-base sm:text-lg font-bold tracking-tight text-foreground">
                Maximilliane's
              </span>
            </Link>
            <span className='px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-primary/10 text-primary border border-primary/20'>
              ADMIN
            </span>
          </div>

          {/* NAV LINK */}
          <nav className='hidden md:flex items-center gap-1 sm:gap-2'>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname.startsWith(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors ${isActive
                    ? "bg-secondary text-foreground font-semibold"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"}`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </nav>

          {/* right profile & public link */}
          <div className='flex items-center gap-3'>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/")}
              className="text-xs h-8 hidden sm:flex items-center gap-1.5"
            >
              <ExternalLink className='w-3.5 h-3.5' />
              <span>Public Portal</span>
            </Button>

            <div className="flex items-center gap-2 pl-2 border-l border-border">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold text-xs border border-primary/30">
                AD
              </div>
              <div className="hidden lg:flex flex-col text-left">
                <span className="text-xs font-semibold leading-tight">Admin Host</span>
                <span className="text-[10px] text-muted-foreground leading-tight">Manager</span>
              </div>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={handleLogout}
                disabled={logout.isPending}
                title="Sign out"
                aria-label="Sign out"
                className="text-muted-foreground hover:text-destructive"
              >
                <LogOut className={`w-4 h-4 ${logout.isPending ? "animate-pulse" : ""}`} />
              </Button>
            </div>
          </div>
        </div>

        {/* mobile navigate bar */}
        <div className='md:hidden flex items-center justify-around border-t border-border bg-card px-2 py-1.5'>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.path)
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center py-1 px-3 text-[10px] font-medium transition-colors ${isActive ? "text-primary font-bold" : "text-muted-foreground"}`}
              >
                <Icon className="w-4 h-4 mb-0.5" />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </div>
      </header>

      <main className='flex-1 container-page py-6 sm:py-8'>
        <Outlet /> 
      </main>
    </div>
  )
}

export default AdminLayout

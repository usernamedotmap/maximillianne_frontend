import { Button } from "@/components/ui/button";
import { Calendar, Mail, MapPin, Menu, ShieldCheck, X, ThumbsUp, Camera } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom"
import Logo from "@/assets/logo.png"

const scrollToPublicSection = (hash: string) => {
  const section = document.getElementById(hash.slice(1));
  if (!section) return;

  const header = document.querySelector<HTMLElement>("[data-public-header]");
  const headerHeight = header?.getBoundingClientRect().height ?? 0;
  const top = window.scrollY + section.getBoundingClientRect().top - headerHeight - 16;
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  window.scrollTo({
    top: Math.max(top, 0),
    behavior: prefersReducedMotion ? "auto" : "smooth",
  });
};

const PublicLayout = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const previousPathname = useRef(location.pathname);

  useEffect(() => {
    const pathnameChanged = previousPathname.current !== location.pathname;
    previousPathname.current = location.pathname;

    if (location.pathname !== "/" || !location.hash) {
      if (pathnameChanged && !location.hash) {
        window.scrollTo({ top: 0, behavior: "auto" });
      }
      return;
    }

    const frame = window.requestAnimationFrame(() =>
      scrollToPublicSection(location.hash),
    );
    return () => window.cancelAnimationFrame(frame);
  }, [location.hash, location.pathname]);

  const handleNavClick = (hasOrPath: string) => {
    setMobileMenuOpen(false);
    if (hasOrPath.startsWith("#")) {
      if (location.pathname !== "/") {
        navigate("/" + hasOrPath);
      } else {
        window.requestAnimationFrame(() => scrollToPublicSection(hasOrPath));
      }
    } else {
      navigate(hasOrPath);
    }
  }
  return (
    <div className='min-h-screen flex flex-col bg-background text-foreground antialiased selection:bg-primary/20'>

      {/* top navbard */}
      <header data-public-header className="sticky top-0 z-40 w-full border-b border-border/80 bg-background/95 backdrop-blur-md transition-all">
        <div className="container-page flex h-16 sm:h-20 items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-3 group transition-transform active:scale-98">
            <img
              src={Logo}
              alt="Maximilline's Haven Logo"
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-full object-cover shadow-xs border border-border"
            />

            <div className="flex flex-col">
              <span className="font-serif text-lg sm:text-xl font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">Maximilliane's Haven</span>
              <span className="text-[10px] tracking-widest uppercase font-medium text-muted-foreground -mt-1">Staycation</span>
            </div>
          </Link>

          {/* desktop nav link dito */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-foreground/80">
            <button
              onClick={() => handleNavClick("#stay-overview")}
              className="hover:text-primary transition-colors cursor-pinter">
              Stay
            </button>
            <Link
              to="/availability"
              className={`hover:text-primary transition-colors ${location.pathname === "/availability" ? "text-primary font-semibold" : ""}`}
            >
              Availability
            </Link>

            <button onClick={() => handleNavClick("#house-rules")} className="hover:text-primary transition-colors cursor-pointer">
              House Rules
            </button>
          </nav>

          {/* right CTA */}
          <div className="hidden sm:flex items-center gap-4">
            <a
              href="https://www.facebook.com/maximillianeshaven"
              className="hidden lg:flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <ThumbsUp className="w-3.5 h-3.5 text-primary" />
              <span>Maximilliane's Haven</span>
            </a>
            <Button
              onClick={() => navigate("/availability")}
              className="bg-primary hover:bg-primary-hover text-primary-foreground font-medium text-xs sm:text-sm px-4 py-2 rounded-lg shadow-sm">
              <Calendar className="w-4 h-4 mr-1.5" />
              Check Availability
            </Button>
          </div>

          {/* mobile menu button */}
          <div className="flex sm:hidden items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle Menu">
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>


        {/* mobiel dropdown menu */}
        {mobileMenuOpen && (
          <div className="sm:hidden border-b border-border bg-card px-4 py-4 space-y-3 shadow-md animate-in slide-in-from-top-2 duration-150">
            <button
            onClick={() => handleNavClick("#stay-overview")}
              className="block w-full text-left py-2 text-sm font-medium hover:text-primary">
              Stay
            </button>
            <Link
            
              to="/availability"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm font-medium hover:text-primary"
            >
              Availability
            </Link>
            <button
            onClick={() => handleNavClick("#house-rules")}
              className="block w-full text-left py-2 text-sm font-medium hover:text-primary"
            >
              House Rules
            </button>
            <div className="pt-2 border-t border-border flex flex-col gap-2">
              <Button
                onClick={() => { setMobileMenuOpen(false); navigate("/availability") }}>
                Check Availability
              </Button>
              <Link
                to="/admin/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center text-xs text-muted-foreground hover:text-foreground py-1">
                Admin Portal
              </Link>
            </div>
          </div>
        )}
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="bg-inverse text-inverse-foreground pt-14 pb-10 border-t border-inverse-muted/20">
        <div className="container-page">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {/* column numbah 1 */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <img
                  src={Logo}
                  alt="Maximilliane's Haven"
                  className="w-9 h-9 rounded-full object-cover border border-white/20"
                />
                <span className="font-serif text-lg font-bold tracking-tight text-white">
                  Maximilliane's Haven
                </span>
              </div>
              <p className="text-xs leading-relaxed text-inverse-muted max-w-sm">   A beautifully designed modern staycation condo in the Philippines, crafted with
                high-end interior aesthetics and premium hospitality details.</p>
            </div>

            {/* Coulunm 2 */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold  tracking-wider uppercase  text-inverse-muted">Quick Links</h4>
              <ul className="space-y-2 text-xs text-inverse-muted">
                <li>
                  <button
                  onClick={() => handleNavClick("#stay-overview")}
                    className="hover:text-white transition-colors">
                    About Maximilliane's
                  </button>
                </li>
                <li>
                  <button
                  onClick={() => handleNavClick("#photo-gallery")}
                    className="hover:text-white transition-colors">
                    Photo Galley
                  </button>
                </li>
                <li>
                  <button onClick={() => handleNavClick("#direct-booking")} className="hover:text-white transition-colors">
                    Direct Booking Notes
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleNavClick("#house-rules")}
                    className="hover:text-white transition-colors">
                    Private Condominium Rules
                  </button>
                </li>
              </ul>
            </div>

            {/* coloum 3 */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold tracking-wider uppercase text-inverse-muted">
                Reservations
              </h4>
              <ul className="space-y-2 text-xs text-inverse-muted">
                <li>
                  <Link to="/availability" className="hover:text-white transition-colors">
                    Check Availability Calendar</Link>
                </li>
                <li>
                  <button
                    onClick={() => handleNavClick("#house-rules")}
                    className="hover:text-white transition-colors"
                  >
                    Booking Terms & Conditions
                  </button>
                </li>
                <li>
                  <Link to="/availability" className="hover:text-white transitions-colors">
                    Gcash Secure Payment FAQ</Link>
                </li>
              </ul>
            </div>

            {/* columns 4 */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold tracking-wider uppercase text-inverse-muted">
                Contact Host
              </h4>
              <div className="space-y-2 text-xs text-inverse-muted">
                <p className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-primary" />
                  <span>maximillianeshaven@gmail.com</span>
                </p>
                <p className="flex items-center gap-2">
                  <ThumbsUp className="w-3.5 h-3.5 text-primary" />
                  <span>Maximilliane's Haven</span>
                </p>
                <p className="flex items-center gap-2">
                  <Camera className="w-3.5 h-3.5 text-primary" />
                  <span>maximillianeshaven</span> 
                </p>
                <p className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-primary" />
                  <span>Trees Residences, Fairview, Quezon City,</span>
                </p>
                <div className="pt-2">
                  <Link to="/admin/login" className="inline-flex items-center gap-1.5 text-xs text-inverse-muted/70 hover:text-white transition-colors pt-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-primary/80" />
                    <span>Admin Portal Access</span>
                  </Link>
                </div>
              </div>
            </div>


          </div>

          <div className="pt-6 border-t border-inverse-muted/10 flex flex-col sm:flex-row items-center justify-between text-[11px] text-inverse-muted gap-3">
            <p>@ 2026 Maximillianne's Haven. Direct booking portal. All rights reserved.</p>
            <p>Trees Residences, Fairview, Quezon City,</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default PublicLayout

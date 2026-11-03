import {Helmet} from "react-helmet"
import { useLocation } from "react-router-dom";

type RouteMetadata = {
  title: string;
  description: string;
  noIndex?: boolean;
};

const defaultMetadata: RouteMetadata = {
  title: "Maximilliane's Haven",
  description:
    "Enjoy a comfortable and thoughtfully equipped stay at Maximilliane's Haven.",
};

const routeMetadata: { matches: (pathname: string) => boolean; metadata: RouteMetadata }[] = [
  {
    matches: (pathname) => pathname === "/",
    metadata: {
      title: "Maximilliane's Haven | Comfortable Stays",
      description:
        "Discover a comfortable, fully equipped stay at Maximilliane's Haven. Explore amenities and plan your visit.",
    },
  },
  {
    matches: (pathname) => pathname === "/availability",
    metadata: {
      title: "Check Availability | Maximilliane's Haven",
      description:
        "View available dates and choose the best time for your stay at Maximilliane's Haven.",
    },
  },
  {
    matches: (pathname) => pathname === "/booking/request",
    metadata: {
      title: "Request a Booking | Maximilliane's Haven",
      description:
        "Submit your stay details to request a booking at Maximilliane's Haven.",
      noIndex: true,
    },
  },
  {
    matches: (pathname) => /^\/booking\/status\/[^/]+$/.test(pathname),
    metadata: {
      title: "Booking Status | Maximilliane's Haven",
      description: "Check the latest status of your Maximilliane's Haven booking.",
      noIndex: true,
    },
  },
  {
    matches: (pathname) => /^\/booking\/[^/]+$/.test(pathname),
    metadata: {
      title: "Booking Payment | Maximilliane's Haven",
      description: "Review your booking and payment details.",
      noIndex: true,
    },
  },
  {
    matches: (pathname) => pathname === "/admin/login",
    metadata: {
      title: "Admin Sign In | Maximilliane's Haven",
      description: "Sign in to manage Maximilliane's Haven.",
      noIndex: true,
    },
  },
  {
    matches: (pathname) => pathname === "/admin/dashboard",
    metadata: {
      title: "Admin Dashboard | Maximilliane's Haven",
      description: "Manage bookings and review property activity.",
      noIndex: true,
    },
  },
  {
    matches: (pathname) => pathname === "/admin/bookings",
    metadata: {
      title: "Manage Bookings | Maximilliane's Haven",
      description: "Review and manage guest bookings.",
      noIndex: true,
    },
  },
  {
    matches: (pathname) => /^\/admin\/bookings\/[^/]+$/.test(pathname),
    metadata: {
      title: "Booking Details | Maximilliane's Haven",
      description: "Review and manage an individual booking.",
      noIndex: true,
    },
  },
  {
    matches: (pathname) => pathname === "/admin/calendar",
    metadata: {
      title: "Booking Calendar | Maximilliane's Haven",
      description: "Review booking and property availability dates.",
      noIndex: true,
    },
  },
];

export default function RouteMeta() {
  const { pathname } = useLocation();
  const metadata =
    routeMetadata.find((route) => route.matches(pathname))?.metadata ??
    defaultMetadata;

  return (
    <Helmet>
      <title>{metadata.title}</title>
      <meta name="description" content={metadata.description} />
      <meta
        name="robots"
        content={metadata.noIndex ? "noindex, nofollow" : "index, follow"}
      />
      <meta property="og:title" content={metadata.title} />
      <meta property="og:description" content={metadata.description} />
      <meta property="og:type" content="website" />
    </Helmet>
  );
}

import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { usePageMeta } from "@/hooks/usePageMeta";

const NotFound = () => {
  const location = useLocation();

  usePageMeta({
    title: "Page Not Found",
    description: "The page you're looking for doesn't exist or has been moved.",
    noindex: true,
  });

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4 text-foreground">404</h1>
        <p className="text-xl text-muted-foreground mb-4">Oops! Page not found</p>
        <Link to="/" className="text-primary hover:underline">
          Return to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;

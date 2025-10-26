import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Header = () => {
  return (
    <header className="absolute top-0 left-0 right-0 z-30 py-4">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="text-2xl font-bold text-white">
            PlumberPro AI
          </Link>

          {/* Right side: Login + Emergency button */}
          <div className="flex items-center gap-4">
            <Link 
              to="/dashboard" 
              className="text-white/90 hover:text-white text-sm font-medium transition-colors hidden sm:block"
            >
              Plumber Login
            </Link>
            
            <Button
              asChild
              className="bg-[hsl(0,85%,50%)] hover:bg-[hsl(0,85%,45%)] text-white font-bold shadow-lg animate-emergency-pulse"
              size="lg"
            >
              <a href="tel:+14707123113" className="flex items-center gap-2">
                🚨 Emergency? Call Now
              </a>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

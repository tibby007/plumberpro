import { Wrench } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-foreground text-background py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 gradient-accent rounded-lg flex items-center justify-center">
                <Wrench className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold">PlumberPro AI</span>
            </div>
            <p className="text-background/70 max-w-md leading-relaxed">
              Professional plumbing services powered by AI. Fast, reliable, and available 24/7 for all your plumbing needs.
            </p>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-semibold mb-4">Services</h4>
            <ul className="space-y-2 text-background/70">
              <li>Emergency Repairs</li>
              <li>Drain Cleaning</li>
              <li>Water Heater Service</li>
              <li>Leak Detection</li>
              <li>Pipe Installation</li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-background/70">
              <li>About Us</li>
              <li>
                <a href="/privacy-policy" className="hover:text-background transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="/terms-of-service" className="hover:text-background transition-colors">
                  Terms of Service
                </a>
              </li>
              <li>Contact</li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-background/20 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-background/60">
          <p>© {currentYear} PlumberPro AI. All rights reserved.</p>
          <p>Licensed, Bonded & Insured | License #12345</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

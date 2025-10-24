import { Button } from "@/components/ui/button";
import { Phone, MessageSquare } from "lucide-react";
import heroImage from "@/assets/hero-plumber.jpg";

const Hero = () => {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      {/* Background with gradient overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroImage}
          alt="Professional plumber at work"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/95 via-primary/85 to-primary/70" />
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl">
          <div className="inline-block mb-4 px-4 py-2 bg-accent/20 border border-accent/30 rounded-full">
            <p className="text-sm font-semibold text-white flex items-center gap-2">
              <span className="inline-block w-2 h-2 bg-accent rounded-full animate-pulse" />
              Available 24/7 for Emergencies
            </p>
          </div>
          
          <h1 className="text-white mb-6 leading-tight">
            Fast, Reliable Plumbing
            <span className="block text-accent">When You Need It Most</span>
          </h1>
          
          <p className="text-xl text-white/90 mb-8 max-w-2xl leading-relaxed">
            Professional plumbing services with instant booking. Emergency repairs, maintenance, and installations by certified experts.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              variant="emergency" 
              size="xl"
              className="group"
            >
              <Phone className="transition-transform group-hover:rotate-12" />
              Book Emergency Service
            </Button>
            <Button 
              variant="hero" 
              size="xl"
              className="bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20"
            >
              <MessageSquare />
              Request Free Estimate
            </Button>
          </div>

          {/* Trust indicators */}
          <div className="mt-12 flex flex-wrap gap-8 text-white/80 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-[hsl(var(--success-green))] rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="font-medium">Licensed & Insured</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-[hsl(var(--success-green))] rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="font-medium">Same-Day Service</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-[hsl(var(--success-green))] rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="font-medium">100% Satisfaction Guaranteed</span>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative element */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent z-10" />
    </section>
  );
};

export default Hero;

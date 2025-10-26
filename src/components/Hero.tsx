import { Button } from "@/components/ui/button";
import { Phone } from "lucide-react";
import heroImage from "@/assets/hero-plumber.jpg";
import { ChatWidget } from "@/components/ChatWidget";

const Hero = () => {
  const scrollToChat = () => {
    const chatSection = document.getElementById('chat-section');
    if (chatSection) {
      chatSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pt-20">
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
      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Header section */}
          <div className="text-center mb-12">
            <div className="inline-block mb-4 px-4 py-2 bg-accent/20 border border-accent/30 rounded-full">
              <p className="text-sm font-semibold text-white flex items-center gap-2">
                <span className="inline-block w-2 h-2 bg-accent rounded-full animate-pulse" />
                Available 24/7 for Emergencies
              </p>
            </div>
            
            <h1 className="text-white mb-6 leading-tight">
              24/7 Emergency Plumbing Help
            </h1>
            
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed">
              Chat with our AI assistant - get instant quotes and book service
            </p>
          </div>

          {/* Embedded Chat Widget - MAIN CTA */}
          <div id="chat-section" className="max-w-2xl mx-auto mb-8">
            <ChatWidget embedded={true} />
          </div>

          {/* Secondary CTA */}
          <div className="text-center mb-12">
            <Button 
              variant="hero" 
              size="xl"
              className="bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20"
              onClick={scrollToChat}
            >
              <Phone className="mr-2" />
              Request Free Estimate
            </Button>
          </div>

          {/* Trust indicators */}
          <div className="flex flex-wrap justify-center gap-8 text-white/80 text-sm">
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

import { lazy, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Phone, Sparkles } from "lucide-react";
import heroImage from "@/assets/hero-plumber.jpg";

// Lazy load chat widget to split bundle
const EmbeddedChatWidget = lazy(() => import("@/components/EmbeddedChatWidget"));

const Hero = () => {
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
        <div className="max-w-7xl mx-auto">
          {/* Two Column Layout: Hero Content + Chat Widget */}
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Hero Content */}
            <div className="text-center lg:text-left order-2 lg:order-1">
              {/* Badge */}
              <div className="inline-block mb-6 px-5 py-2.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full">
                <p className="text-sm font-semibold text-white flex items-center gap-2">
                  <span className="inline-block w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50" />
                  Available 24/7 for Emergencies
                </p>
              </div>

              {/* Main Headline */}
              <h1 className="text-white mb-6 leading-tight text-4xl md:text-5xl lg:text-6xl font-bold">
                24/7 Emergency
                <br />
                <span className="text-blue-200">Plumbing Help</span>
              </h1>

              {/* Subheadline */}
              <p className="text-xl md:text-2xl text-white/90 mb-8 leading-relaxed">
                Chat with Sarah, our AI assistant - get instant quotes, emergency help, and book service in minutes
              </p>

              {/* Features List */}
              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3 text-white/90">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="font-medium text-lg">Instant AI responses - Voice or text</span>
                </div>
                <div className="flex items-center gap-3 text-white/90">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="font-medium text-lg">Same-day emergency service</span>
                </div>
                <div className="flex items-center gap-3 text-white/90">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="font-medium text-lg">Licensed, insured & guaranteed</span>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button
                  size="xl"
                  className="bg-green-500 hover:bg-green-600 text-white font-bold text-lg px-8 py-6 shadow-2xl border-2 border-green-400 animate-pulse hover:animate-none"
                  onClick={() => {
                    const chatWidget = document.querySelector('#embedded-chat-widget');
                    chatWidget?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }}
                >
                  <Sparkles className="mr-2 w-5 h-5" />
                  Try Voice Chat Now
                </Button>
                <Button
                  variant="outline"
                  size="xl"
                  className="bg-white/10 backdrop-blur-sm border-2 border-white/40 hover:bg-white/20 text-white font-semibold text-lg px-8 py-6"
                  asChild
                >
                  <a href="tel:+15551234567">
                    <Phone className="mr-2 w-5 h-5" />
                    Call (555) 123-4567
                  </a>
                </Button>
              </div>
            </div>

            {/* Right: Embedded Chat Widget */}
            <div id="embedded-chat-widget" className="order-1 lg:order-2 flex justify-center lg:justify-end">
              <Suspense fallback={
                <div className="w-full max-w-[500px] mx-auto h-[600px] bg-white rounded-xl shadow-2xl flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">Loading chat...</p>
                  </div>
                </div>
              }>
                <EmbeddedChatWidget />
              </Suspense>
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

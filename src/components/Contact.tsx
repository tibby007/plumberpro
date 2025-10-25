import { Button } from "@/components/ui/button";
import { Phone, Mail, MapPin, Clock } from "lucide-react";

const Contact = () => {
  return (
    <section className="py-24 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="mb-4">Get In Touch</h2>
            <p className="text-xl text-muted-foreground">
              Ready to solve your plumbing problem? Reach out to us anytime.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            {/* Contact info */}
            <div className="space-y-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 gradient-hero rounded-xl flex items-center justify-center flex-shrink-0">
                  <Phone className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Phone</h3>
                  <p className="text-muted-foreground mb-1">1 470-712-3113</p>
                  <p className="text-sm text-muted-foreground">Available 24/7 for emergencies</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 gradient-hero rounded-xl flex items-center justify-center flex-shrink-0">
                  <Mail className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Email</h3>
                  <p className="text-muted-foreground mb-1">service@plumberpro.com</p>
                  <p className="text-sm text-muted-foreground">We'll respond within 1 hour</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 gradient-hero rounded-xl flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Service Area</h3>
                  <p className="text-muted-foreground mb-1">Serving Greater Metro Area</p>
                  <p className="text-sm text-muted-foreground">50-mile radius coverage</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 gradient-hero rounded-xl flex items-center justify-center flex-shrink-0">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Business Hours</h3>
                  <p className="text-muted-foreground mb-1">Mon-Fri: 7:00 AM - 8:00 PM</p>
                  <p className="text-muted-foreground mb-1">Sat-Sun: 8:00 AM - 6:00 PM</p>
                  <p className="text-sm text-accent font-semibold">Emergency service 24/7</p>
                </div>
              </div>
            </div>

            {/* CTA section */}
            <div className="bg-card rounded-2xl p-8 shadow-lg border border-border flex flex-col justify-center">
              <h3 className="text-2xl font-bold mb-4">Need Help Now?</h3>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Our AI assistant is ready to help you 24/7. Describe your issue and get instant support, quotes, and booking options.
              </p>
              
              <div className="space-y-4">
                <Button 
                  size="lg" 
                  className="w-full"
                  onClick={() => {
                    if (window.LeadConnector) {
                      window.LeadConnector.openWidget();
                      setTimeout(() => {
                        const chatInput = document.querySelector('[data-testid="chat-input"], textarea, input[type="text"]') as HTMLInputElement | HTMLTextAreaElement;
                        if (chatInput) {
                          chatInput.value = "Hi, I need help with a plumbing issue.";
                          chatInput.dispatchEvent(new Event('input', { bubbles: true }));
                        }
                      }, 500);
                    }
                  }}
                >
                  Start Chat Now
                </Button>
                <Button variant="outline" size="lg" className="w-full" asChild>
                  <a href="tel:+14707123113">
                    <Phone />
                    Call for Emergency
                  </a>
                </Button>
              </div>

              <div className="mt-6 pt-6 border-t border-border">
                <p className="text-sm text-muted-foreground text-center">
                  Average response time: <span className="font-semibold text-accent">Under 2 minutes</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;

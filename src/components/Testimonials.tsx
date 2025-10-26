import { Star, Clock, Shield, CheckCircle2 } from "lucide-react";

const Testimonials = () => {
  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Homeowner",
      content: "Called at 2 AM with a burst pipe - they had someone here within 30 minutes! Professional, fast, and the AI chat made booking so easy.",
      rating: 5,
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop"
    },
    {
      name: "Mike Rodriguez",
      role: "Property Manager",
      content: "Best plumbing service I've ever used. The chat assistant knew exactly what I needed and got me a quote instantly. No more phone tag!",
      rating: 5,
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop"
    },
    {
      name: "Jennifer Lee",
      role: "Restaurant Owner",
      content: "Emergency water heater replacement on a Sunday. They quoted me through chat, showed up same day, and fixed everything. Saved my business.",
      rating: 5,
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop"
    },
    {
      name: "David Martinez",
      role: "Homeowner",
      content: "Skeptical about AI chat at first, but it was amazing. Got my drain unclogged within 2 hours of my first message. Will definitely use again!",
      rating: 5,
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop"
    }
  ];

  return (
    <section className="py-20 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Star Rating Header */}
          <div className="text-center mb-16">
            <div className="flex justify-center items-center gap-2 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-8 h-8 fill-[hsl(45,100%,50%)] text-[hsl(45,100%,50%)]" />
              ))}
            </div>
            <h2 className="text-4xl font-bold mb-2">4.9/5 from 500+ customers</h2>
            <p className="text-xl text-muted-foreground">
              Real people, real emergencies, real results
            </p>
          </div>

          {/* Testimonials Grid */}
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            {testimonials.map((testimonial, index) => (
              <div 
                key={index}
                className="bg-card rounded-xl p-6 shadow-lg border border-border hover:shadow-xl transition-shadow"
              >
                <div className="flex items-start gap-4 mb-4">
                  <img 
                    src={testimonial.image} 
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-semibold">{testimonial.name}</h4>
                      <div className="flex gap-1">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-[hsl(45,100%,50%)] text-[hsl(45,100%,50%)]" />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  "{testimonial.content}"
                </p>
              </div>
            ))}
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <div className="text-center p-6 bg-card rounded-xl border border-border">
              <div className="w-12 h-12 gradient-hero rounded-xl flex items-center justify-center mx-auto mb-4">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-2">2min</h3>
              <p className="text-muted-foreground">Average response time</p>
            </div>

            <div className="text-center p-6 bg-card rounded-xl border border-border">
              <div className="w-12 h-12 gradient-hero rounded-xl flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-2">24/7</h3>
              <p className="text-muted-foreground">Emergency service available</p>
            </div>

            <div className="text-center p-6 bg-card rounded-xl border border-border">
              <div className="w-12 h-12 gradient-hero rounded-xl flex items-center justify-center mx-auto mb-4">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Licensed</h3>
              <p className="text-muted-foreground">Fully insured professionals</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;

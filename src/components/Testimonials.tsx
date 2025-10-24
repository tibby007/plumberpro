import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Sarah Johnson",
    location: "Downtown",
    rating: 5,
    text: "Called at 2 AM with a burst pipe. They arrived within 30 minutes and had it fixed in an hour. Absolutely saved us!",
  },
  {
    name: "Michael Chen",
    location: "Riverside",
    rating: 5,
    text: "The booking process was so easy. The plumber was professional, explained everything, and the price was exactly as quoted.",
  },
  {
    name: "Emily Rodriguez",
    location: "Westside",
    rating: 5,
    text: "Best plumbing service I've ever used. Fast response, quality work, and they cleaned up after themselves. Highly recommend!",
  },
];

const Testimonials = () => {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="mb-4">What Our Customers Say</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Join thousands of satisfied customers who trust us with their plumbing needs
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-card rounded-2xl p-8 shadow-md hover:shadow-lg transition-shadow duration-300 border border-border"
            >
              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-[hsl(var(--emergency-orange))] text-[hsl(var(--emergency-orange))]" />
                ))}
              </div>

              {/* Testimonial text */}
              <p className="text-foreground mb-6 leading-relaxed italic">
                "{testimonial.text}"
              </p>

              {/* Author */}
              <div className="border-t border-border pt-4">
                <p className="font-semibold text-foreground">{testimonial.name}</p>
                <p className="text-sm text-muted-foreground">{testimonial.location}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Trust badges */}
        <div className="mt-16 flex flex-wrap justify-center items-center gap-8 text-center">
          <div className="px-6 py-4 bg-secondary rounded-lg">
            <p className="text-3xl font-bold text-primary mb-1">5,000+</p>
            <p className="text-sm text-muted-foreground">Happy Customers</p>
          </div>
          <div className="px-6 py-4 bg-secondary rounded-lg">
            <p className="text-3xl font-bold text-primary mb-1">24/7</p>
            <p className="text-sm text-muted-foreground">Emergency Service</p>
          </div>
          <div className="px-6 py-4 bg-secondary rounded-lg">
            <p className="text-3xl font-bold text-primary mb-1">15+</p>
            <p className="text-sm text-muted-foreground">Years Experience</p>
          </div>
          <div className="px-6 py-4 bg-secondary rounded-lg">
            <p className="text-3xl font-bold text-primary mb-1">100%</p>
            <p className="text-sm text-muted-foreground">Satisfaction Rate</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;

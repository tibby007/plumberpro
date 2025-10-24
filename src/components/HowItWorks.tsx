import { MessageSquare, Calendar, Wrench } from "lucide-react";

const steps = [
  {
    icon: MessageSquare,
    title: "Tell Us Your Issue",
    description: "Chat with our AI assistant or call us. Describe your plumbing problem and we'll assess the urgency.",
  },
  {
    icon: Calendar,
    title: "Instant Booking",
    description: "Choose your preferred time slot. For emergencies, we dispatch a certified plumber immediately.",
  },
  {
    icon: Wrench,
    title: "Expert Service",
    description: "Our licensed professionals arrive on time, diagnose the issue, and fix it right—guaranteed.",
  },
];

const HowItWorks = () => {
  return (
    <section className="py-24 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="mb-4">How It Works</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Get professional plumbing service in three simple steps
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div 
                key={index}
                className="relative bg-card rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                {/* Step number */}
                <div className="absolute -top-4 -left-4 w-12 h-12 gradient-hero rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                  {index + 1}
                </div>

                {/* Icon */}
                <div className="mb-6 pt-4">
                  <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center">
                    <Icon className="w-8 h-8 text-accent" />
                  </div>
                </div>

                {/* Content */}
                <h3 className="mb-3">{step.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;

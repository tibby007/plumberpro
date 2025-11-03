import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const TermsOfService = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-12 max-w-4xl">
        <Link to="/">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </Link>

        <article className="prose prose-lg max-w-none">
          <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
          
          <p className="text-muted-foreground mb-8">
            Last updated: {new Date().toLocaleDateString()}
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
            <p>
              By accessing and using PlumberPro's services, you agree to be bound by these Terms of Service. 
              If you do not agree to these terms, please do not use our services.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. Service Description</h2>
            <p>
              PlumberPro provides professional plumbing services including emergency repairs, drain cleaning, 
              water heater service, leak detection, and pipe installation. We utilize AI-powered chat assistance 
              to help customers schedule appointments and receive quotes.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. User Responsibilities</h2>
            <p className="mb-2">When using our services, you agree to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Provide accurate and complete information</li>
              <li>Maintain the confidentiality of your account information</li>
              <li>Notify us immediately of any unauthorized use of your account</li>
              <li>Use our services only for lawful purposes</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. Appointments and Cancellations</h2>
            <p className="mb-2">
              Appointments are subject to availability. We reserve the right to reschedule appointments 
              due to emergencies or unforeseen circumstances.
            </p>
            <p>
              Cancellation policies may apply. Please contact us at least 24 hours in advance 
              to cancel or reschedule your appointment.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. Pricing and Payment</h2>
            <p>
              Service quotes are estimates based on the information provided. Final pricing may vary 
              based on the actual work required. Payment is due upon completion of services unless 
              otherwise agreed upon in writing.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">6. Warranty and Liability</h2>
            <p className="mb-2">
              We stand behind our work and provide warranties on services performed. However, 
              we are not liable for:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Pre-existing conditions not disclosed by the customer</li>
              <li>Damage caused by customer negligence or misuse</li>
              <li>Issues arising from work performed by other contractors</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">7. Emergency Services</h2>
            <p>
              While we strive to provide prompt emergency service, response times may vary based on 
              availability and location. Emergency service rates may apply outside of normal business hours.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">8. Modifications to Terms</h2>
            <p>
              We reserve the right to modify these Terms of Service at any time. Changes will be 
              effective immediately upon posting to our website. Continued use of our services 
              constitutes acceptance of modified terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">9. Contact Information</h2>
            <p>
              For questions about these Terms of Service, please contact us at:{" "}
              <a href="mailto:support@emergestack.dev" className="text-primary hover:underline">
                support@emergestack.dev
              </a>
            </p>
          </section>
        </article>
      </main>

      <Footer />
    </div>
  );
};

export default TermsOfService;

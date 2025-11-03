import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const PrivacyPolicy = () => {
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
          <h1 className="text-4xl font-bold mb-8">Privacy Policy for PlumberPro</h1>
          
          <p className="text-muted-foreground mb-8">
            PlumberPro ("we," "us," or "our") values your privacy.
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Information We Collect</h2>
            <p>
              We collect personal information such as your name, phone number, email address, 
              and service details when you submit a request through our website forms or chat assistant.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">How We Use Your Information</h2>
            <p>
              Your information is used to respond to inquiries, provide service quotes, 
              schedule appointments, and send service-related SMS updates and reminders.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">SMS Consent & Opt-Out</h2>
            <p className="mb-4">
              By submitting your phone number on our website, you consent to receive SMS messages 
              from PlumberPro related to your inquiry or scheduled services. Message and data rates may apply.
            </p>
            <p className="mb-2">
              <strong>Reply STOP to opt out at any time.</strong>
            </p>
            <p>
              SMS consent is not required to purchase goods or services.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Data Sharing</h2>
            <p>
              We do not sell or share your personal information with third parties for marketing purposes.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Security</h2>
            <p>
              We maintain reasonable data protection practices to safeguard your information.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
            <p>
              For privacy concerns or questions, contact:{" "}
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

export default PrivacyPolicy;

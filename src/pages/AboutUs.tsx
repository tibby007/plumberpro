import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ArrowLeft, Award, Users, Clock, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const AboutUs = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground py-20">
          <div className="container mx-auto px-4">
            <Link to="/">
              <Button variant="ghost" className="mb-6 text-primary-foreground hover:bg-primary-foreground/20">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
            </Link>
            
            <h1 className="text-5xl font-bold mb-6">About PlumberPro</h1>
            <p className="text-xl max-w-3xl opacity-90">
              Revolutionizing plumbing services with AI-powered technology and expert craftsmanship since 2019.
            </p>
          </div>
        </section>

        {/* Our Story */}
        <section className="py-16 container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-6">Our Story</h2>
            <div className="prose prose-lg max-w-none space-y-4 text-muted-foreground">
              <p>
                Founded in 2019 by master plumber Michael Rodriguez and tech entrepreneur Sarah Chen, 
                PlumberPro was born from a simple observation: the plumbing industry needed a modern, 
                customer-first approach that combined traditional expertise with cutting-edge technology.
              </p>
              <p>
                What started as a small team of five licensed plumbers in San Francisco has grown into 
                a trusted service provider across the Bay Area, serving over 15,000 satisfied customers. 
                Our secret? We listen, we innovate, and we never compromise on quality.
              </p>
              <p>
                In 2023, we pioneered the integration of AI-powered customer service in the plumbing 
                industry, making it easier than ever for customers to get instant quotes, schedule 
                appointments, and receive expert guidance 24/7.
              </p>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="bg-muted py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-12 text-center">Our Core Values</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              <Card>
                <CardContent className="pt-6">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <Award className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Excellence</h3>
                  <p className="text-sm text-muted-foreground">
                    Every job meets the highest standards of quality and professionalism.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Customer First</h3>
                  <p className="text-sm text-muted-foreground">
                    Your satisfaction and comfort are our top priorities.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <Clock className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Reliability</h3>
                  <p className="text-sm text-muted-foreground">
                    On-time service and transparent communication, always.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <Shield className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Integrity</h3>
                  <p className="text-sm text-muted-foreground">
                    Honest assessments and fair pricing you can trust.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Team */}
        <section className="py-16 container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold mb-12 text-center">Meet Our Leadership</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="w-20 h-20 bg-gradient-to-br from-primary to-primary/60 rounded-full flex items-center justify-center text-2xl font-bold text-primary-foreground">
                      MR
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-1">Michael Rodriguez</h3>
                      <p className="text-sm text-primary mb-3">Co-Founder & Chief Operations Officer</p>
                      <p className="text-sm text-muted-foreground">
                        With over 20 years of plumbing experience and a master plumber license, 
                        Michael ensures every job meets the highest industry standards. He personally 
                        trains every member of our field team.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="w-20 h-20 bg-gradient-to-br from-primary to-primary/60 rounded-full flex items-center justify-center text-2xl font-bold text-primary-foreground">
                      SC
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-1">Sarah Chen</h3>
                      <p className="text-sm text-primary mb-3">Co-Founder & CEO</p>
                      <p className="text-sm text-muted-foreground">
                        A Stanford MBA and former tech executive, Sarah brings innovation and 
                        customer-centric thinking to the plumbing industry. She led the development 
                        of our AI-powered service platform.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground py-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto text-center">
              <div>
                <div className="text-4xl font-bold mb-2">15K+</div>
                <div className="text-sm opacity-90">Happy Customers</div>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">50+</div>
                <div className="text-sm opacity-90">Licensed Plumbers</div>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">24/7</div>
                <div className="text-sm opacity-90">Emergency Service</div>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">4.9★</div>
                <div className="text-sm opacity-90">Average Rating</div>
              </div>
            </div>
          </div>
        </section>

        {/* Mission */}
        <section className="py-16 container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
            <p className="text-xl text-muted-foreground leading-relaxed">
              To make professional plumbing services accessible, transparent, and stress-free 
              for every homeowner and business. We combine the reliability of traditional craftsmanship 
              with the convenience of modern technology to deliver exceptional service, every time.
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default AboutUs;

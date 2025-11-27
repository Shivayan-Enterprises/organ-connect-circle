import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Heart, Shield, Users, Clock, Award, Globe, ArrowRight } from "lucide-react";

export default function About() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="bg-gradient-to-br from-primary/5 via-background to-primary/10 py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">About OrganConnect</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            We're on a mission to save lives by connecting organ donors with patients in need, 
            supported by healthcare professionals who ensure safe and ethical practices.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center max-w-5xl mx-auto">
            <div>
              <h2 className="text-3xl font-bold mb-4">Our Mission</h2>
              <p className="text-muted-foreground mb-6">
                Every day, thousands of people wait for organ transplants that could save their lives. 
                OrganConnect bridges the gap between donors and patients, making the process transparent, 
                secure, and efficient.
              </p>
              <p className="text-muted-foreground">
                We believe that technology can play a crucial role in healthcare, and our platform 
                is designed to facilitate life-saving connections while maintaining the highest 
                standards of privacy and security.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Card className="bg-primary/5 border-0">
                <CardContent className="pt-6 text-center">
                  <Heart className="h-8 w-8 text-primary mx-auto mb-2" />
                  <p className="text-2xl font-bold">1000+</p>
                  <p className="text-sm text-muted-foreground">Lives Impacted</p>
                </CardContent>
              </Card>
              <Card className="bg-success/5 border-0">
                <CardContent className="pt-6 text-center">
                  <Users className="h-8 w-8 text-success mx-auto mb-2" />
                  <p className="text-2xl font-bold">500+</p>
                  <p className="text-sm text-muted-foreground">Active Users</p>
                </CardContent>
              </Card>
              <Card className="bg-warning/5 border-0">
                <CardContent className="pt-6 text-center">
                  <Award className="h-8 w-8 text-warning mx-auto mb-2" />
                  <p className="text-2xl font-bold">50+</p>
                  <p className="text-sm text-muted-foreground">Partner Hospitals</p>
                </CardContent>
              </Card>
              <Card className="bg-primary/5 border-0">
                <CardContent className="pt-6 text-center">
                  <Globe className="h-8 w-8 text-primary mx-auto mb-2" />
                  <p className="text-2xl font-bold">10+</p>
                  <p className="text-sm text-muted-foreground">Cities Covered</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Our Values</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              The principles that guide everything we do
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <Card>
              <CardContent className="pt-6">
                <Shield className="h-10 w-10 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">Privacy & Security</h3>
                <p className="text-muted-foreground">
                  We protect sensitive medical information with industry-leading security measures 
                  and strict privacy policies.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <Users className="h-10 w-10 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">Transparency</h3>
                <p className="text-muted-foreground">
                  Every step of the donation process is clear and documented, ensuring trust 
                  between all parties involved.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <Clock className="h-10 w-10 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">Efficiency</h3>
                <p className="text-muted-foreground">
                  Time is critical in organ donation. Our platform streamlines the matching 
                  process to save precious time.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-center">Frequently Asked Questions</h2>
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2">How does the matching process work?</h3>
                <p className="text-muted-foreground">
                  Patients list their organ requirements, and donors register their willingness to donate. 
                  Our platform helps connect compatible matches based on blood type, organ type, and location.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Is my information secure?</h3>
                <p className="text-muted-foreground">
                  Yes, we use industry-standard encryption and security measures to protect all personal 
                  and medical information. Only authorized healthcare professionals can access sensitive data.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">How are donors verified?</h3>
                <p className="text-muted-foreground">
                  All donors go through a verification process by registered doctors on our platform. 
                  Medical documents are reviewed before approval.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Is the service free?</h3>
                <p className="text-muted-foreground">
                  Yes, OrganConnect is completely free for patients, donors, and healthcare professionals. 
                  Our mission is to save lives, not generate profit.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-primary/5">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Make a Difference?</h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Join our community of donors, patients, and healthcare professionals working together to save lives.
          </p>
          <Button size="lg" onClick={() => navigate("/auth")}>
            Get Started
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
}

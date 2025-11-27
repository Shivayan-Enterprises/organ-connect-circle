import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { 
  Heart, 
  Users, 
  Stethoscope, 
  Search, 
  UserPlus, 
  Shield, 
  CheckCircle,
  ArrowRight,
  Droplets,
  MapPin
} from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ donors: 0, patients: 0, matches: 0 });
  const [featuredDonors, setFeaturedDonors] = useState<any[]>([]);

  useEffect(() => {
    fetchStats();
    fetchFeaturedDonors();
  }, []);

  const fetchStats = async () => {
    const { count: donorCount } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("role", "donor");
    
    const { count: patientCount } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("role", "patient");

    setStats({
      donors: donorCount || 0,
      patients: patientCount || 0,
      matches: Math.floor((donorCount || 0) * 0.3),
    });
  };

  const fetchFeaturedDonors = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("role", "donor")
      .eq("approved_by_doctor", true)
      .limit(3);
    setFeaturedDonors(data || []);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-primary/10" />
        <div className="container mx-auto px-4 py-20 md:py-32 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge variant="secondary" className="mb-4">
                Trusted by 50+ hospitals
              </Badge>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground mb-6">
                Give the Gift of{" "}
                <span className="text-primary">Life</span>
              </h1>
              <p className="text-lg text-muted-foreground mb-8 max-w-lg">
                Connect with patients in need, register as an organ donor, and be part of a life-saving community. Every donation counts.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" onClick={() => navigate("/auth")}>
                  Register as Donor
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button size="lg" variant="outline" onClick={() => navigate("/donors")}>
                  <Search className="mr-2 h-4 w-4" />
                  Find a Donor
                </Button>
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="relative">
                <div className="absolute -top-4 -left-4 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-4 -right-4 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
                <div className="relative bg-card border border-border rounded-2xl p-8 shadow-lg">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                      <Heart className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stats.donors}+</p>
                      <p className="text-sm text-muted-foreground">Registered Donors</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 mb-6">
                    <div className="h-16 w-16 rounded-full bg-success/10 flex items-center justify-center">
                      <Users className="h-8 w-8 text-success" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stats.patients}+</p>
                      <p className="text-sm text-muted-foreground">Patients Helped</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-full bg-warning/10 flex items-center justify-center">
                      <CheckCircle className="h-8 w-8 text-warning" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stats.matches}+</p>
                      <p className="text-sm text-muted-foreground">Successful Matches</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section - Mobile */}
      <section className="lg:hidden border-y border-border bg-muted/30">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-primary">{stats.donors}+</p>
              <p className="text-xs text-muted-foreground">Donors</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-primary">{stats.patients}+</p>
              <p className="text-xs text-muted-foreground">Patients</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-primary">{stats.matches}+</p>
              <p className="text-xs text-muted-foreground">Matches</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Getting started is simple. Follow these three steps to begin your journey.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <UserPlus className="h-8 w-8 text-primary" />
              </div>
              <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-4 text-sm font-bold">
                1
              </div>
              <h3 className="text-xl font-semibold mb-2">Create Account</h3>
              <p className="text-muted-foreground">
                Sign up as a donor, patient, or healthcare professional with your basic information.
              </p>
            </div>
            <div className="text-center">
              <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-4 text-sm font-bold">
                2
              </div>
              <h3 className="text-xl font-semibold mb-2">Verify Details</h3>
              <p className="text-muted-foreground">
                Complete your profile with medical history and get verified by our healthcare team.
              </p>
            </div>
            <div className="text-center">
              <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Heart className="h-8 w-8 text-primary" />
              </div>
              <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-4 text-sm font-bold">
                3
              </div>
              <h3 className="text-xl font-semibold mb-2">Connect & Save Lives</h3>
              <p className="text-muted-foreground">
                Browse matches, communicate directly, and complete the donation process.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Roles Section */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Who Can Join?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our platform serves everyone in the organ donation ecosystem.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <Card className="bg-card border-border hover:shadow-lg transition-shadow">
              <CardContent className="pt-8 pb-6 px-6">
                <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <Heart className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Donors</h3>
                <p className="text-muted-foreground mb-4">
                  Register to become an organ donor and help save lives. Your generosity can give someone a second chance.
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    Search for patients
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    Direct messaging
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    Video consultations
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-card border-border hover:shadow-lg transition-shadow">
              <CardContent className="pt-8 pb-6 px-6">
                <div className="h-14 w-14 rounded-xl bg-success/10 flex items-center justify-center mb-4">
                  <Users className="h-7 w-7 text-success" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Patients</h3>
                <p className="text-muted-foreground mb-4">
                  Register your organ requirements and connect with compatible donors quickly and securely.
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    Add requirements
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    Browse donors
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    Track status
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-card border-border hover:shadow-lg transition-shadow">
              <CardContent className="pt-8 pb-6 px-6">
                <div className="h-14 w-14 rounded-xl bg-warning/10 flex items-center justify-center mb-4">
                  <Stethoscope className="h-7 w-7 text-warning" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Doctors</h3>
                <p className="text-muted-foreground mb-4">
                  Oversee the donation process, verify donors, and ensure safe medical procedures.
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-warning" />
                    Approve donors
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-warning" />
                    Review profiles
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-warning" />
                    Facilitate matching
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured Donors */}
      {featuredDonors.length > 0 && (
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-2">Featured Donors</h2>
                <p className="text-muted-foreground">Verified donors ready to help</p>
              </div>
              <Button variant="outline" onClick={() => navigate("/donors")}>
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {featuredDonors.map((donor) => (
                <Card 
                  key={donor.id} 
                  className="bg-card border-border hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => navigate(`/donor/${donor.id}`)}
                >
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-lg font-semibold text-primary">
                            {donor.full_name?.charAt(0)?.toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-semibold">{donor.full_name}</h4>
                          <p className="text-sm text-muted-foreground">Verified Donor</p>
                        </div>
                      </div>
                      <Badge variant="default" className="bg-success text-success-foreground">
                        Approved
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-3 text-sm">
                      {donor.blood_type && (
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Droplets className="h-4 w-4" />
                          {donor.blood_type}
                        </div>
                      )}
                      {donor.location && (
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          {donor.location}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-primary/5">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Make a Difference?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Join thousands of donors and patients on our platform. Your decision today could save a life tomorrow.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={() => navigate("/auth")}>
                Get Started Now
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate("/about")}>
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;

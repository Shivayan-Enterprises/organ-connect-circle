import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Users, Activity, Shield } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
      <header className="container mx-auto px-4 py-6">
        <nav className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Heart className="w-8 h-8 text-primary" />
            <span className="text-2xl font-bold">Organ Donation System</span>
          </div>
          <Button onClick={() => navigate("/auth")}>
            Sign In / Register
          </Button>
        </nav>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-medical-blue bg-clip-text text-transparent">
            Connecting Lives Through Organ Donation
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            A comprehensive platform connecting patients, donors, and healthcare professionals to save lives through organ donation.
          </p>
          <Button size="lg" onClick={() => navigate("/auth")} className="text-lg px-8">
            Get Started
            <Heart className="w-5 h-5 ml-2" />
          </Button>
        </div>

        <div className="grid gap-8 md:grid-cols-3 max-w-5xl mx-auto">
          <Card className="border-2 hover:border-primary/50 transition-colors">
            <CardHeader>
              <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <CardTitle>For Patients</CardTitle>
              <CardDescription>
                Register your organ requirements and connect with potential donors
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Add multiple organ requirements</li>
                <li>• Browse available donors</li>
                <li>• Direct contact with donors</li>
                <li>• Track requirement status</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-primary/50 transition-colors">
            <CardHeader>
              <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Heart className="w-6 h-6 text-primary" />
              </div>
              <CardTitle>For Donors</CardTitle>
              <CardDescription>
                Help save lives by registering as an organ donor
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Search for patients in need</li>
                <li>• View detailed requirements</li>
                <li>• Contact patients directly</li>
                <li>• Make a life-changing difference</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-primary/50 transition-colors">
            <CardHeader>
              <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Activity className="w-6 h-6 text-primary" />
              </div>
              <CardTitle>For Doctors</CardTitle>
              <CardDescription>
                Oversee and manage the donation process professionally
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• View all patients and donors</li>
                <li>• Track active requirements</li>
                <li>• Access comprehensive data</li>
                <li>• Facilitate matching process</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="mt-16 text-center bg-card/50 backdrop-blur-sm border border-border rounded-2xl p-8 max-w-3xl mx-auto">
          <Shield className="w-12 h-12 text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">Secure & Professional</h2>
          <p className="text-muted-foreground">
            Our platform ensures data privacy and security while providing a seamless experience for all users. Built with healthcare standards in mind.
          </p>
        </div>
      </main>

      <footer className="container mx-auto px-4 py-8 mt-16 border-t border-border">
        <div className="text-center text-muted-foreground">
          <p>© 2024 Organ Donation System. Saving lives through technology.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;

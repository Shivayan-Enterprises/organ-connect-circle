import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Heart, User, Phone, Mail, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DonorDashboardProps {
  profile: any;
}

const DonorDashboard = ({ profile }: DonorDashboardProps) => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [requirements, setRequirements] = useState<any[]>([]);

  useEffect(() => {
    fetchPatients();
    fetchRequirements();
  }, []);

  const fetchPatients = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("role", "patient");

    if (data) setPatients(data);
  };

  const fetchRequirements = async () => {
    const { data } = await supabase
      .from("organ_requirements")
      .select("*, profiles(*)")
      .eq("status", "active")
      .order("urgency", { ascending: true });

    if (data) setRequirements(data);
  };

  const filteredPatients = patients.filter((patient) =>
    patient.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "critical": return "destructive";
      case "urgent": return "default";
      case "moderate": return "secondary";
      default: return "secondary";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">Welcome, {profile.full_name}</h2>
        <p className="text-muted-foreground">Donor Dashboard</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search patients by name or location..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <Heart className="w-5 h-5 text-primary" />
            Active Organ Requirements
          </h3>
          <Button onClick={() => navigate("/patients")} variant="outline">
            View All Patients
          </Button>
        </div>

        {requirements.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No active organ requirements at this time.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {requirements.map((req) => (
              <Card 
                key={req.id} 
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => navigate(`/patient/${req.patient_id}`)}
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="capitalize">{req.organ_type}</CardTitle>
                      <CardDescription className="flex items-center gap-1 mt-1">
                        <User className="w-3 h-3" />
                        {req.profiles?.full_name}
                      </CardDescription>
                    </div>
                    <Badge variant={getUrgencyColor(req.urgency)}>
                      {req.urgency}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Blood Type Required</p>
                    <p className="text-sm text-muted-foreground">{req.blood_type_required}</p>
                  </div>
                  {req.description && (
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Details</p>
                      <p className="text-sm text-muted-foreground">{req.description}</p>
                    </div>
                  )}
                  {req.profiles && (
                    <div className="pt-3 border-t space-y-2">
                      {req.profiles.phone && (
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="w-4 h-4 text-muted-foreground" />
                          <span>{req.profiles.phone}</span>
                        </div>
                      )}
                      {req.profiles.email && (
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="w-4 h-4 text-muted-foreground" />
                          <span>{req.profiles.email}</span>
                        </div>
                      )}
                      {req.profiles.location && (
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                          <span>{req.profiles.location}</span>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DonorDashboard;

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Users, Heart } from "lucide-react";
import AddRequirementDialog from "./AddRequirementDialog";

interface PatientDashboardProps {
  profile: any;
}

const PatientDashboard = ({ profile }: PatientDashboardProps) => {
  const navigate = useNavigate();
  const [requirements, setRequirements] = useState<any[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);

  const fetchRequirements = async () => {
    const { data } = await supabase
      .from("organ_requirements")
      .select("*")
      .eq("patient_id", profile.id)
      .order("created_at", { ascending: false });

    if (data) setRequirements(data);
  };

  useEffect(() => {
    fetchRequirements();
  }, [profile.id]);

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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold">Welcome, {profile.full_name}</h2>
          <p className="text-muted-foreground">Patient Dashboard</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => navigate("/donors")} variant="outline">
            <Users className="w-4 h-4 mr-2" />
            View Donors
          </Button>
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Requirement
          </Button>
        </div>
      </div>

      <div className="grid gap-4">
        <h3 className="text-xl font-semibold flex items-center gap-2">
          <Heart className="w-5 h-5 text-primary" />
          Your Organ Requirements
        </h3>

        {requirements.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground mb-4">
                You haven't added any organ requirements yet.
              </p>
              <Button onClick={() => setShowAddDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Requirement
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {requirements.map((req) => (
              <Card key={req.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="capitalize">{req.organ_type}</CardTitle>
                    <Badge variant={getUrgencyColor(req.urgency)}>
                      {req.urgency}
                    </Badge>
                  </div>
                  <CardDescription>
                    Blood Type Required: {req.blood_type_required}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{req.description}</p>
                  <div className="mt-4">
                    <Badge variant={req.status === "active" ? "default" : "secondary"}>
                      {req.status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <AddRequirementDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        patientId={profile.id}
        onSuccess={fetchRequirements}
      />
    </div>
  );
};

export default PatientDashboard;

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Mail, Phone, MapPin, Heart, Calendar } from "lucide-react";

export default function PatientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [patient, setPatient] = useState<any>(null);
  const [requirements, setRequirements] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);

      const { data: patientData, error: patientError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", id)
        .single();

      if (patientError) throw patientError;
      setPatient(patientData);

      const { data: reqData, error: reqError } = await supabase
        .from("organ_requirements")
        .select("*")
        .eq("patient_id", id)
        .eq("status", "active");

      if (reqError) throw reqError;
      setRequirements(reqData || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSendRequest = async () => {
    if (!message.trim()) {
      toast({
        title: "Error",
        description: "Please enter a message",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase.from("contact_requests").insert({
        sender_id: currentUser?.id,
        recipient_id: id,
        message: message.trim(),
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Contact request sent successfully",
      });
      setMessage("");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Patient not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-3xl">{patient.full_name}</CardTitle>
            <CardDescription>Patient Profile</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{patient.email}</span>
              </div>
              {patient.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{patient.phone}</span>
                </div>
              )}
              {patient.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{patient.location}</span>
                </div>
              )}
              {patient.blood_type && (
                <div className="flex items-center gap-2">
                  <Heart className="h-4 w-4 text-muted-foreground" />
                  <span>Blood Type: {patient.blood_type}</span>
                </div>
              )}
              {patient.age && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Age: {patient.age}</span>
                </div>
              )}
            </div>
            {patient.medical_history && (
              <div>
                <h3 className="font-semibold mb-2">Medical History</h3>
                <p className="text-muted-foreground">{patient.medical_history}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Organ Requirements</CardTitle>
          </CardHeader>
          <CardContent>
            {requirements.length === 0 ? (
              <p className="text-muted-foreground">No active requirements</p>
            ) : (
              <div className="space-y-4">
                {requirements.map((req) => (
                  <Card key={req.id}>
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-lg">{req.organ_type}</h3>
                        <Badge variant={req.urgency === "critical" ? "destructive" : "default"}>
                          {req.urgency}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        Blood Type Required: {req.blood_type_required}
                      </p>
                      {req.description && (
                        <p className="text-sm">{req.description}</p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {currentUser?.id !== id && (
          <Card>
            <CardHeader>
              <CardTitle>Send Contact Request</CardTitle>
              <CardDescription>Send a message to this patient</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Enter your message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
              />
              <Button onClick={handleSendRequest} className="w-full">
                Send Request
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

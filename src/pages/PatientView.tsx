import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Search } from "lucide-react";

export default function PatientView() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [patients, setPatients] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("role", "patient")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPatients(data || []);
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

  const filteredPatients = patients.filter((patient) =>
    patient.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.location?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <h1 className="text-3xl font-bold">All Patients</h1>
          <div className="w-20" />
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {loading ? (
          <p className="text-center text-muted-foreground">Loading patients...</p>
        ) : filteredPatients.length === 0 ? (
          <p className="text-center text-muted-foreground">No patients found</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPatients.map((patient) => (
              <Card
                key={patient.id}
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => navigate(`/patient/${patient.id}`)}
              >
                <CardHeader>
                  <CardTitle>{patient.full_name}</CardTitle>
                  <CardDescription>{patient.email}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    {patient.blood_type && (
                      <p>
                        <span className="font-semibold">Blood Type:</span> {patient.blood_type}
                      </p>
                    )}
                    {patient.age && (
                      <p>
                        <span className="font-semibold">Age:</span> {patient.age}
                      </p>
                    )}
                    {patient.location && (
                      <p>
                        <span className="font-semibold">Location:</span> {patient.location}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

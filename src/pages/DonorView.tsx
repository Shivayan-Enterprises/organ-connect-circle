import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Search } from "lucide-react";

export default function DonorView() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [donors, setDonors] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);

  useEffect(() => {
    fetchDonors();
    fetchCurrentUser();
  }, []);

  const fetchCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();
      setCurrentUserRole(profile?.role || null);
    }
  };

  const fetchDonors = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("role", "donor")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setDonors(data || []);
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

  const filteredDonors = donors.filter((donor) =>
    donor.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    donor.location?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <h1 className="text-2xl font-bold mb-4">Donors</h1>
          
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search donors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {loading ? (
          <p className="text-muted-foreground">Loading...</p>
        ) : filteredDonors.length === 0 ? (
          <p className="text-muted-foreground">No donors found</p>
        ) : (
          <div className="space-y-3">
            {filteredDonors.map((donor) => (
              <Card
                key={donor.id}
                className="cursor-pointer hover:bg-accent/50"
                onClick={() => navigate(`/donor/${donor.id}`)}
              >
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{donor.full_name}</CardTitle>
                      <CardDescription className="text-sm">{donor.email}</CardDescription>
                    </div>
                    {currentUserRole === "doctor" && (
                      <Badge variant={donor.approved_by_doctor ? "default" : "secondary"} className="text-xs">
                        {donor.approved_by_doctor ? "Approved" : "Pending"}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex flex-wrap gap-4 text-sm">
                    {donor.blood_type && (
                      <span>Blood: {donor.blood_type}</span>
                    )}
                    {donor.age && (
                      <span>Age: {donor.age}</span>
                    )}
                    {donor.location && (
                      <span>Location: {donor.location}</span>
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

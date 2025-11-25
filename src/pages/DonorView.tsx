import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Search } from "lucide-react";

export default function DonorView() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [donors, setDonors] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDonors();
  }, []);

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
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <h1 className="text-3xl font-bold">All Donors</h1>
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
          <p className="text-center text-muted-foreground">Loading donors...</p>
        ) : filteredDonors.length === 0 ? (
          <p className="text-center text-muted-foreground">No donors found</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDonors.map((donor) => (
              <Card
                key={donor.id}
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => navigate(`/donor/${donor.id}`)}
              >
                <CardHeader>
                  <CardTitle>{donor.full_name}</CardTitle>
                  <CardDescription>{donor.email}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    {donor.blood_type && (
                      <p>
                        <span className="font-semibold">Blood Type:</span> {donor.blood_type}
                      </p>
                    )}
                    {donor.age && (
                      <p>
                        <span className="font-semibold">Age:</span> {donor.age}
                      </p>
                    )}
                    {donor.location && (
                      <p>
                        <span className="font-semibold">Location:</span> {donor.location}
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

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Search, Droplets, MapPin, User, Filter, X } from "lucide-react";

const bloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export default function DonorView() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [donors, setDonors] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [bloodFilter, setBloodFilter] = useState<string>("");
  const [cityFilter, setCityFilter] = useState("");
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

  const filteredDonors = donors.filter((donor) => {
    const matchesSearch = donor.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      donor.location?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesBlood = !bloodFilter || bloodFilter === "all" || donor.blood_type === bloodFilter;
    const matchesCity = !cityFilter || donor.location?.toLowerCase().includes(cityFilter.toLowerCase());
    return matchesSearch && matchesBlood && matchesCity;
  });

  const clearFilters = () => {
    setSearchQuery("");
    setBloodFilter("");
    setCityFilter("");
  };

  const hasActiveFilters = searchQuery || bloodFilter || cityFilter;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="bg-gradient-to-br from-primary/5 via-background to-primary/10 py-12 md:py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Find Donors</h1>
          <p className="text-muted-foreground">Browse verified organ donors and connect with them directly</p>
        </div>
      </section>

      {/* Filters */}
      <section className="border-b border-border bg-card sticky top-16 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Select value={bloodFilter} onValueChange={setBloodFilter}>
                <SelectTrigger className="w-[140px]">
                  <Droplets className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Blood Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {bloodTypes.map((type) => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="City"
                  value={cityFilter}
                  onChange={(e) => setCityFilter(e.target.value)}
                  className="w-[140px] pl-10"
                />
              </div>
              {hasActiveFilters && (
                <Button variant="ghost" size="icon" onClick={clearFilters}>
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Results */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-muted-foreground">
              {filteredDonors.length} donor{filteredDonors.length !== 1 ? "s" : ""} found
            </p>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading donors...</p>
            </div>
          ) : filteredDonors.length === 0 ? (
            <div className="text-center py-12">
              <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No donors found matching your criteria</p>
              {hasActiveFilters && (
                <Button variant="link" onClick={clearFilters} className="mt-2">
                  Clear filters
                </Button>
              )}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredDonors.map((donor) => (
                <Card
                  key={donor.id}
                  className="bg-card border-border hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => navigate(`/donor/${donor.id}`)}
                >
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="h-11 w-11 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-base font-semibold text-primary">
                            {donor.full_name?.charAt(0)?.toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm">{donor.full_name}</h4>
                          <p className="text-xs text-muted-foreground">{donor.email}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {donor.blood_type && (
                        <Badge variant="outline" className="text-xs">
                          <Droplets className="h-3 w-3 mr-1" />
                          {donor.blood_type}
                        </Badge>
                      )}
                      {donor.location && (
                        <Badge variant="outline" className="text-xs">
                          <MapPin className="h-3 w-3 mr-1" />
                          {donor.location}
                        </Badge>
                      )}
                      {donor.age && (
                        <Badge variant="outline" className="text-xs">
                          Age {donor.age}
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      {currentUserRole === "doctor" ? (
                        <Badge 
                          variant={donor.approved_by_doctor ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {donor.approved_by_doctor ? "Approved" : "Pending"}
                        </Badge>
                      ) : (
                        <Badge 
                          variant={donor.approved_by_doctor ? "default" : "secondary"}
                          className="text-xs bg-success/10 text-success border-0"
                        >
                          {donor.approved_by_doctor ? "Verified" : "Under Review"}
                        </Badge>
                      )}
                      <Button variant="ghost" size="sm" className="text-xs">
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}

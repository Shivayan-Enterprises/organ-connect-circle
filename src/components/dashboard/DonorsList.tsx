import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, User, Phone, Mail, MapPin, Heart } from "lucide-react";

interface DonorsListProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DonorsList = ({ open, onOpenChange }: DonorsListProps) => {
  const [donors, setDonors] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (open) {
      fetchDonors();
    }
  }, [open]);

  const fetchDonors = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("role", "donor");

    if (data) setDonors(data);
  };

  const filteredDonors = donors.filter((donor) =>
    donor.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    donor.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    donor.blood_type?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-primary" />
            Available Donors
          </DialogTitle>
          <DialogDescription>
            Browse and contact potential organ donors
          </DialogDescription>
        </DialogHeader>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, location, or blood type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="space-y-4">
          {filteredDonors.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No donors found
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredDonors.map((donor) => (
                <Card key={donor.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <User className="w-5 h-5 text-primary" />
                        <CardTitle className="text-lg">{donor.full_name}</CardTitle>
                      </div>
                      {donor.blood_type && (
                        <Badge variant="outline">{donor.blood_type}</Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid gap-2">
                      {donor.email && (
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="w-4 h-4 text-muted-foreground" />
                          <span>{donor.email}</span>
                        </div>
                      )}
                      {donor.phone && (
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="w-4 h-4 text-muted-foreground" />
                          <span>{donor.phone}</span>
                        </div>
                      )}
                      {donor.location && (
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                          <span>{donor.location}</span>
                        </div>
                      )}
                      {donor.age && (
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-muted-foreground">Age:</span>
                          <span>{donor.age} years</span>
                        </div>
                      )}
                    </div>
                    {donor.medical_history && (
                      <div className="pt-2 border-t">
                        <p className="text-sm text-muted-foreground">
                          {donor.medical_history}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DonorsList;

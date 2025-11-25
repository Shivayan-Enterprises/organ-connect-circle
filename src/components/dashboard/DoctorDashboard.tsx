import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Users, Heart, Activity } from "lucide-react";

interface DoctorDashboardProps {
  profile: any;
}

const DoctorDashboard = ({ profile }: DoctorDashboardProps) => {
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalDonors: 0,
    activeRequirements: 0,
  });
  const [patients, setPatients] = useState<any[]>([]);
  const [donors, setDonors] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [patientsRes, donorsRes, requirementsRes] = await Promise.all([
      supabase.from("profiles").select("*").eq("role", "patient"),
      supabase.from("profiles").select("*").eq("role", "donor"),
      supabase.from("organ_requirements").select("*").eq("status", "active"),
    ]);

    setPatients(patientsRes.data || []);
    setDonors(donorsRes.data || []);
    setStats({
      totalPatients: patientsRes.data?.length || 0,
      totalDonors: donorsRes.data?.length || 0,
      activeRequirements: requirementsRes.data?.length || 0,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">Welcome, Dr. {profile.full_name}</h2>
        <p className="text-muted-foreground">Medical Professional Dashboard</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
            <Users className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.totalPatients}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Donors</CardTitle>
            <Heart className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.totalDonors}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Requirements</CardTitle>
            <Activity className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.activeRequirements}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="patients" className="space-y-4">
        <TabsList>
          <TabsTrigger value="patients">Patients</TabsTrigger>
          <TabsTrigger value="donors">Donors</TabsTrigger>
        </TabsList>

        <TabsContent value="patients" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {patients.map((patient) => (
              <Card key={patient.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{patient.full_name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Email:</span>
                    <span>{patient.email}</span>
                  </div>
                  {patient.blood_type && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Blood Type:</span>
                      <Badge variant="outline">{patient.blood_type}</Badge>
                    </div>
                  )}
                  {patient.age && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Age:</span>
                      <span>{patient.age}</span>
                    </div>
                  )}
                  {patient.location && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Location:</span>
                      <span>{patient.location}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="donors" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {donors.map((donor) => (
              <Card key={donor.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{donor.full_name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Email:</span>
                    <span>{donor.email}</span>
                  </div>
                  {donor.blood_type && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Blood Type:</span>
                      <Badge variant="outline">{donor.blood_type}</Badge>
                    </div>
                  )}
                  {donor.age && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Age:</span>
                      <span>{donor.age}</span>
                    </div>
                  )}
                  {donor.location && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Location:</span>
                      <span>{donor.location}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DoctorDashboard;

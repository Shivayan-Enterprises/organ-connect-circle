import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, User, Upload, FileText, Trash2, Loader2 } from "lucide-react";

const bloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export default function Profile() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [documents, setDocuments] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    location: "",
    age: "",
    blood_type: "",
    medical_history: "",
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) throw error;

      setProfile(data);
      setFormData({
        full_name: data.full_name || "",
        phone: data.phone || "",
        location: data.location || "",
        age: data.age?.toString() || "",
        blood_type: data.blood_type || "",
        medical_history: data.medical_history || "",
      });

      // Fetch documents
      await fetchDocuments(user.id);
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

  const fetchDocuments = async (userId: string) => {
    try {
      const { data, error } = await supabase.storage
        .from("medical-documents")
        .list(userId);

      if (error) throw error;
      setDocuments(data?.map(file => file.name) || []);
    } catch (error) {
      console.error("Error fetching documents:", error);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: formData.full_name,
          phone: formData.phone || null,
          location: formData.location || null,
          age: formData.age ? parseInt(formData.age) : null,
          blood_type: formData.blood_type as "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-" | null,
          medical_history: formData.medical_history || null,
        })
        .eq("id", profile.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;

    setUploading(true);
    try {
      const filePath = `${profile.id}/${Date.now()}_${file.name}`;
      const { error } = await supabase.storage
        .from("medical-documents")
        .upload(filePath, file);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Document uploaded successfully",
      });
      
      await fetchDocuments(profile.id);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteDocument = async (fileName: string) => {
    if (!profile) return;

    try {
      const { error } = await supabase.storage
        .from("medical-documents")
        .remove([`${profile.id}/${fileName}`]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Document deleted",
      });
      
      await fetchDocuments(profile.id);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getDocumentUrl = (fileName: string) => {
    const { data } = supabase.storage
      .from("medical-documents")
      .getPublicUrl(`${profile.id}/${fileName}`);
    return data.publicUrl;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-2xl mx-auto">
        <Button variant="ghost" onClick={() => navigate("/dashboard")} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              My Profile
            </CardTitle>
            <CardDescription>
              {profile?.role === "patient" && "Patient Profile"}
              {profile?.role === "donor" && "Donor Profile"}
              {profile?.role === "doctor" && "Doctor Profile"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" value={profile?.email || ""} disabled />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="Enter phone number"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="City, Country"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  placeholder="Age"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="blood_type">Blood Type</Label>
                <Select
                  value={formData.blood_type}
                  onValueChange={(value) => setFormData({ ...formData, blood_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select blood type" />
                  </SelectTrigger>
                  <SelectContent>
                    {bloodTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="medical_history">Medical History</Label>
              <Textarea
                id="medical_history"
                value={formData.medical_history}
                onChange={(e) => setFormData({ ...formData, medical_history: e.target.value })}
                placeholder="Enter relevant medical history..."
                rows={4}
              />
            </div>

            <Button onClick={handleSave} disabled={saving} className="w-full">
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Save Changes
            </Button>
          </CardContent>
        </Card>

        {profile?.role !== "doctor" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Medical Documents
              </CardTitle>
              <CardDescription>
                Upload your medical documents for verification
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Input
                  type="file"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="flex-1"
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                />
                <Button disabled={uploading} variant="outline">
                  {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                </Button>
              </div>

              {documents.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No documents uploaded yet
                </p>
              ) : (
                <div className="space-y-2">
                  {documents.map((doc) => (
                    <div
                      key={doc}
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-md"
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm truncate max-w-[200px]">{doc}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteDocument(doc)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

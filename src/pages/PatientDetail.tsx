import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ChatInterface from "@/components/chat/ChatInterface";
import VideoCall from "@/components/video/VideoCall";
import { 
  ArrowLeft, Mail, Phone, MapPin, Calendar, 
  MessageCircle, Video, FileText, Send, Droplets, User, Heart
} from "lucide-react";

export default function PatientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [patient, setPatient] = useState<any>(null);
  const [requirements, setRequirements] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [currentProfile, setCurrentProfile] = useState<any>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [showChat, setShowChat] = useState(false);
  const [videoRoomName, setVideoRoomName] = useState<string | null>(null);
  const [documents, setDocuments] = useState<string[]>([]);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);

      if (user) {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();
        setCurrentProfile(profileData);
      }

      const { data: patientData, error: patientError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", id)
        .single();

      if (patientError) throw patientError;
      setPatient(patientData);

      if (currentProfile?.role === "doctor" || user?.id === patientData.id) {
        const { data: files } = await supabase.storage
          .from("medical-documents")
          .list(patientData.id);
        setDocuments(files?.map(f => f.name) || []);
      }

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

  const startVideoCall = () => {
    const roomName = `organ-donation-${currentUser?.id}-${patient.id}-${Date.now()}`;
    setVideoRoomName(roomName);
    toast({
      title: "Success",
      description: "Video call started",
    });
  };

  const endVideoCall = () => {
    setVideoRoomName(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center py-20">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center py-20">
          <p className="text-muted-foreground">Patient not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Profile */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-6 mb-6">
                  <div className="h-20 w-20 rounded-full bg-success/10 flex items-center justify-center">
                    <User className="h-10 w-10 text-success" />
                  </div>
                  <div className="flex-1">
                    <h1 className="text-2xl font-bold">{patient.full_name}</h1>
                    <p className="text-muted-foreground">Patient</p>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Email</p>
                      <p className="text-sm font-medium">{patient.email}</p>
                    </div>
                  </div>
                  {patient.phone && (
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      <Phone className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Phone</p>
                        <p className="text-sm font-medium">{patient.phone}</p>
                      </div>
                    </div>
                  )}
                  {patient.location && (
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      <MapPin className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Location</p>
                        <p className="text-sm font-medium">{patient.location}</p>
                      </div>
                    </div>
                  )}
                  {patient.blood_type && (
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      <Droplets className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Blood Type</p>
                        <p className="text-sm font-medium">{patient.blood_type}</p>
                      </div>
                    </div>
                  )}
                  {patient.age && (
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      <Calendar className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Age</p>
                        <p className="text-sm font-medium">{patient.age} years</p>
                      </div>
                    </div>
                  )}
                </div>

                {patient.medical_history && (
                  <div className="mt-6">
                    <h3 className="font-semibold mb-2">Medical History</h3>
                    <p className="text-sm text-muted-foreground">{patient.medical_history}</p>
                  </div>
                )}

                {documents.length > 0 && (
                  <div className="mt-6">
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Medical Documents
                    </h3>
                    <div className="space-y-2">
                      {documents.map((doc, idx) => (
                        <a
                          key={idx}
                          href={supabase.storage.from("medical-documents").getPublicUrl(`${patient.id}/${doc}`).data.publicUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm text-primary hover:underline p-2 rounded-lg bg-primary/5"
                        >
                          <FileText className="w-4 h-4" />
                          {doc}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Organ Requirements */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-primary" />
                  Organ Requirements
                </CardTitle>
              </CardHeader>
              <CardContent>
                {requirements.length === 0 ? (
                  <p className="text-muted-foreground text-sm">No active requirements</p>
                ) : (
                  <div className="space-y-4">
                    {requirements.map((req) => (
                      <div key={req.id} className="p-4 rounded-lg border border-border">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold capitalize">{req.organ_type}</h4>
                          <Badge variant={req.urgency === "critical" ? "destructive" : "default"}>
                            {req.urgency}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          Blood Type Required: <span className="font-medium">{req.blood_type_required}</span>
                        </p>
                        {req.description && (
                          <p className="text-sm text-muted-foreground">{req.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Chat Section */}
            {showChat && currentProfile && currentUser?.id !== id && (
              <ChatInterface
                recipientId={id!}
                recipientName={patient.full_name}
                currentUserId={currentUser.id}
              />
            )}

            {/* Video Call */}
            {videoRoomName && (
              <VideoCall 
                roomName={videoRoomName} 
                userName={currentProfile?.full_name || "User"}
                onLeave={endVideoCall} 
              />
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Actions */}
            {currentUser?.id !== id && !videoRoomName && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => setShowChat(!showChat)}
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    {showChat ? "Hide Chat" : "Start Chat"}
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={startVideoCall}
                  >
                    <Video className="w-4 h-4 mr-2" />
                    Video Call
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Contact Request */}
            {currentUser?.id !== id && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Send Request</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Textarea
                    placeholder="Write your message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={4}
                  />
                  <Button onClick={handleSendRequest} className="w-full">
                    <Send className="w-4 h-4 mr-2" />
                    Send Request
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, CheckCircle, XCircle, Mail, Clock, User } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface ContactRequest {
  id: string;
  sender_id: string;
  recipient_id: string;
  message: string;
  response: string | null;
  status: string;
  created_at: string;
  sender_profile?: any;
  recipient_profile?: any;
}

export default function Notifications() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [receivedRequests, setReceivedRequests] = useState<ContactRequest[]>([]);
  const [sentRequests, setSentRequests] = useState<ContactRequest[]>([]);
  const [responseText, setResponseText] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
    
    // Set up real-time subscription
    const channel = supabase
      .channel('contact_requests_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'contact_requests'
        },
        () => {
          fetchData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);

      if (!user) return;

      // Fetch received requests
      const { data: received, error: receivedError } = await supabase
        .from("contact_requests")
        .select(`
          *,
          sender_profile:profiles!sender_id(*)
        `)
        .eq("recipient_id", user.id)
        .order("created_at", { ascending: false });

      if (receivedError) throw receivedError;
      setReceivedRequests(received || []);

      // Fetch sent requests
      const { data: sent, error: sentError } = await supabase
        .from("contact_requests")
        .select(`
          *,
          recipient_profile:profiles!recipient_id(*)
        `)
        .eq("sender_id", user.id)
        .order("created_at", { ascending: false });

      if (sentError) throw sentError;
      setSentRequests(sent || []);
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

  const handleAccept = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from("contact_requests")
        .update({
          status: "accepted",
          response: responseText[requestId] || null,
        })
        .eq("id", requestId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Contact request accepted",
      });
      setResponseText({ ...responseText, [requestId]: "" });
      fetchData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDecline = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from("contact_requests")
        .update({
          status: "declined",
          response: responseText[requestId] || null,
        })
        .eq("id", requestId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Contact request declined",
      });
      setResponseText({ ...responseText, [requestId]: "" });
      fetchData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "accepted":
        return <Badge className="bg-green-500 hover:bg-green-600">Accepted</Badge>;
      case "declined":
        return <Badge variant="destructive">Declined</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading notifications...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <div className="mb-6">
          <h1 className="text-3xl font-bold">Notifications</h1>
          <p className="text-muted-foreground">Manage your contact requests</p>
        </div>

        <Tabs defaultValue="received" className="space-y-4">
          <TabsList>
            <TabsTrigger value="received">
              Received ({receivedRequests.filter(r => r.status === "pending").length})
            </TabsTrigger>
            <TabsTrigger value="sent">
              Sent ({sentRequests.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="received" className="space-y-4">
            {receivedRequests.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-muted-foreground">No contact requests received</p>
                </CardContent>
              </Card>
            ) : (
              receivedRequests.map((request) => (
                <Card key={request.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <User className="h-8 w-8 text-muted-foreground" />
                        <div>
                          <CardTitle className="text-lg">
                            {request.sender_profile?.full_name || "Unknown User"}
                          </CardTitle>
                          <CardDescription className="flex items-center gap-2">
                            <Clock className="h-3 w-3" />
                            {formatDistanceToNow(new Date(request.created_at), { addSuffix: true })}
                          </CardDescription>
                        </div>
                      </div>
                      {getStatusBadge(request.status)}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="text-sm font-semibold mb-1 flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        Message:
                      </h4>
                      <p className="text-sm text-muted-foreground bg-muted p-3 rounded">
                        {request.message}
                      </p>
                    </div>

                    {request.response && (
                      <div>
                        <h4 className="text-sm font-semibold mb-1">Your Response:</h4>
                        <p className="text-sm text-muted-foreground bg-muted p-3 rounded">
                          {request.response}
                        </p>
                      </div>
                    )}

                    {request.status === "pending" && (
                      <div className="space-y-3">
                        <Textarea
                          placeholder="Add a response (optional)..."
                          value={responseText[request.id] || ""}
                          onChange={(e) =>
                            setResponseText({ ...responseText, [request.id]: e.target.value })
                          }
                          rows={3}
                        />
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleAccept(request.id)}
                            className="flex-1"
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Accept
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={() => handleDecline(request.id)}
                            className="flex-1"
                          >
                            <XCircle className="mr-2 h-4 w-4" />
                            Decline
                          </Button>
                        </div>
                      </div>
                    )}

                    <Button
                      variant="outline"
                      onClick={() => navigate(`/${request.sender_profile?.role}/${request.sender_id}`)}
                      className="w-full"
                    >
                      View Profile
                    </Button>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="sent" className="space-y-4">
            {sentRequests.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-muted-foreground">No contact requests sent</p>
                </CardContent>
              </Card>
            ) : (
              sentRequests.map((request) => (
                <Card key={request.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <User className="h-8 w-8 text-muted-foreground" />
                        <div>
                          <CardTitle className="text-lg">
                            To: {request.recipient_profile?.full_name || "Unknown User"}
                          </CardTitle>
                          <CardDescription className="flex items-center gap-2">
                            <Clock className="h-3 w-3" />
                            {formatDistanceToNow(new Date(request.created_at), { addSuffix: true })}
                          </CardDescription>
                        </div>
                      </div>
                      {getStatusBadge(request.status)}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="text-sm font-semibold mb-1 flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        Your Message:
                      </h4>
                      <p className="text-sm text-muted-foreground bg-muted p-3 rounded">
                        {request.message}
                      </p>
                    </div>

                    {request.response && (
                      <div>
                        <h4 className="text-sm font-semibold mb-1">Their Response:</h4>
                        <p className="text-sm text-muted-foreground bg-muted p-3 rounded">
                          {request.response}
                        </p>
                      </div>
                    )}

                    <Button
                      variant="outline"
                      onClick={() => navigate(`/${request.recipient_profile?.role}/${request.recipient_id}`)}
                      className="w-full"
                    >
                      View Profile
                    </Button>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
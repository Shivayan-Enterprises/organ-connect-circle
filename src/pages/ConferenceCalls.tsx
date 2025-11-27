import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Video, Users, Clock, CheckCircle, XCircle } from "lucide-react";
import VideoCall from "@/components/video/VideoCall";
import ConferenceCallDialog from "@/components/video/ConferenceCallDialog";

interface CallRequest {
  id: string;
  title: string;
  room_name: string;
  status: string;
  created_at: string;
  started_at: string | null;
  initiator: {
    full_name: string;
  };
  participants: Array<{
    id: string;
    status: string;
    user: {
      full_name: string;
    };
  }>;
}

interface MyParticipation {
  id: string;
  status: string;
  call_request: {
    id: string;
    title: string;
    room_name: string;
    status: string;
    created_at: string;
    initiator: {
      full_name: string;
    };
  };
}

export default function ConferenceCalls() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [myCreatedCalls, setMyCreatedCalls] = useState<CallRequest[]>([]);
  const [myInvitations, setMyInvitations] = useState<MyParticipation[]>([]);
  const [activeCall, setActiveCall] = useState<{ roomName: string; title: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    if (currentUser) {
      fetchCalls();
      const cleanup = subscribeToChanges();
      return cleanup;
    }
  }, [currentUser]);

  const fetchCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      setCurrentUser(profile);
    }
    setLoading(false);
  };

  const fetchCalls = async () => {
    if (!currentUser) return;
    
    try {
      // Fetch calls I created
      const { data: createdCalls, error: createdError } = await supabase
        .from("video_call_requests")
        .select(`
          id,
          title,
          room_name,
          status,
          created_at,
          started_at,
          initiator:profiles!video_call_requests_initiator_id_fkey (
            full_name
          ),
          participants:video_call_participants (
            id,
            status,
            user:profiles!video_call_participants_user_id_fkey (
              full_name
            )
          )
        `)
        .eq("initiator_id", currentUser.id)
        .order("created_at", { ascending: false });

      if (createdError) throw createdError;
      setMyCreatedCalls(createdCalls as any || []);

      // Fetch calls I was invited to
      const { data: invitedCalls, error: invitedError } = await supabase
        .from("video_call_participants")
        .select(`
          id,
          status,
          call_request:video_call_requests (
            id,
            title,
            room_name,
            status,
            created_at,
            initiator:profiles!video_call_requests_initiator_id_fkey (
              full_name
            )
          )
        `)
        .eq("user_id", currentUser.id)
        .order("created_at", { ascending: false });

      if (invitedError) throw invitedError;
      setMyInvitations(invitedCalls as any || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const subscribeToChanges = () => {
    const channel = supabase
      .channel("conference-calls-updates")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "video_call_requests",
        },
        () => fetchCalls()
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "video_call_participants",
        },
        () => fetchCalls()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const respondToInvitation = async (participantId: string, newStatus: "accepted" | "declined") => {
    try {
      const { error } = await supabase
        .from("video_call_participants")
        .update({
          status: newStatus,
          responded_at: new Date().toISOString(),
        })
        .eq("id", participantId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Invitation ${newStatus}`,
      });

      fetchCalls();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const joinCall = async (callRequestId: string, roomName: string, title: string, participantId?: string) => {
    try {
      // Check if all participants accepted
      const { data: participants, error: participantsError } = await supabase
        .from("video_call_participants")
        .select("status")
        .eq("call_request_id", callRequestId);

      if (participantsError) throw participantsError;

      const allAccepted = participants?.every((p) => p.status === "accepted");

      if (!allAccepted) {
        toast({
          title: "Waiting for participants",
          description: "Not all participants have accepted yet",
        });
        return;
      }

      // Update call status to active
      const { error: updateError } = await supabase
        .from("video_call_requests")
        .update({
          status: "active",
          started_at: new Date().toISOString(),
        })
        .eq("id", callRequestId);

      if (updateError) throw updateError;

      // Update participant status if provided
      if (participantId) {
        await supabase
          .from("video_call_participants")
          .update({ status: "joined" })
          .eq("id", participantId);
      }

      setActiveCall({ roomName, title });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const leaveCall = () => {
    setActiveCall(null);
    fetchCalls();
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; icon: any }> = {
      invited: { variant: "secondary", icon: Clock },
      accepted: { variant: "default", icon: CheckCircle },
      declined: { variant: "destructive", icon: XCircle },
      joined: { variant: "default", icon: Video },
    };

    const config = variants[status] || variants.invited;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="w-3 h-3" />
        {status}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-5xl mx-auto">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (activeCall) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-5xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>{activeCall.title}</CardTitle>
              <CardDescription>Conference Call</CardDescription>
            </CardHeader>
            <CardContent>
              <VideoCall
                roomName={activeCall.roomName}
                userName={currentUser?.full_name || "User"}
                onLeave={leaveCall}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-5xl mx-auto">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold mb-2">Conference Calls</h1>
            <p className="text-muted-foreground">Manage your video conferences</p>
          </div>
          {currentUser && (
            <ConferenceCallDialog
              currentUserId={currentUser.id}
              currentUserName={currentUser.full_name}
            />
          )}
        </div>

        <Tabs defaultValue="invited" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="invited">
              Invitations ({myInvitations.length})
            </TabsTrigger>
            <TabsTrigger value="created">
              Created by Me ({myCreatedCalls.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="invited" className="space-y-4 mt-4">
            {myInvitations.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No invitations</p>
            ) : (
              myInvitations.map((invitation) => {
                const callRequest = invitation.call_request;
                if (!callRequest) return null;
                
                return (
                <Card key={invitation.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">
                          {callRequest.title}
                        </CardTitle>
                        <CardDescription>
                          Invited by {callRequest.initiator?.full_name || 'Unknown'}
                        </CardDescription>
                      </div>
                      {getStatusBadge(invitation.status)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2">
                      {invitation.status === "invited" && (
                        <>
                          <Button
                            onClick={() => respondToInvitation(invitation.id, "accepted")}
                            className="flex-1"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Accept
                          </Button>
                          <Button
                            onClick={() => respondToInvitation(invitation.id, "declined")}
                            variant="destructive"
                            className="flex-1"
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Decline
                          </Button>
                        </>
                      )}
                      {invitation.status === "accepted" && callRequest.status === "pending" && (
                        <Button
                          onClick={() => joinCall(
                            callRequest.id,
                            callRequest.room_name,
                            callRequest.title,
                            invitation.id
                          )}
                          className="w-full"
                        >
                          <Video className="w-4 h-4 mr-2" />
                          Join Call
                        </Button>
                      )}
                      {callRequest.status === "active" && (
                        <Button
                          onClick={() => setActiveCall({
                            roomName: callRequest.room_name,
                            title: callRequest.title
                          })}
                          className="w-full"
                        >
                          <Video className="w-4 h-4 mr-2" />
                          Rejoin Call
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
              })
            )}
          </TabsContent>

          <TabsContent value="created" className="space-y-4 mt-4">
            {myCreatedCalls.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No calls created yet</p>
            ) : (
              myCreatedCalls.map((call) => {
                const participants = call.participants || [];
                return (
                <Card key={call.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">{call.title}</CardTitle>
                    <CardDescription>
                      {participants.length} participant{participants.length !== 1 ? 's' : ''}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2">
                      {participants.map((participant) => (
                        <div key={participant.id} className="flex justify-between items-center text-sm">
                          <span>{participant.user?.full_name || 'Unknown'}</span>
                          {getStatusBadge(participant.status)}
                        </div>
                      ))}
                    </div>
                    {call.status === "pending" && (
                      <Button
                        onClick={() => joinCall(call.id, call.room_name, call.title)}
                        className="w-full"
                      >
                        <Video className="w-4 h-4 mr-2" />
                        Start Call
                      </Button>
                    )}
                    {call.status === "active" && (
                      <Button
                        onClick={() => setActiveCall({ roomName: call.room_name, title: call.title })}
                        className="w-full"
                      >
                        <Video className="w-4 h-4 mr-2" />
                        Join Active Call
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
              })
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

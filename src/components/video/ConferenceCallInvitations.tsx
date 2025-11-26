import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Video, Check, X, Users } from "lucide-react";
import VideoCall from "./VideoCall";

interface ConferenceCallInvitationsProps {
  currentUserId: string;
  currentUserName: string;
}

interface Invitation {
  id: string;
  call_request_id: string;
  status: string;
  call_request: {
    id: string;
    title: string;
    room_name: string;
    status: string;
    initiator: {
      full_name: string;
    };
  };
}

export default function ConferenceCallInvitations({ currentUserId, currentUserName }: ConferenceCallInvitationsProps) {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [activeCall, setActiveCall] = useState<{ roomName: string; title: string } | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchInvitations();
    subscribeToInvitations();
  }, [currentUserId]);

  const fetchInvitations = async () => {
    try {
      console.log("Fetching invitations for user:", currentUserId);
      
      const { data, error } = await supabase
        .from("video_call_participants")
        .select(`
          id,
          call_request_id,
          status,
          call_request:video_call_requests (
            id,
            title,
            room_name,
            status,
            initiator:profiles!video_call_requests_initiator_id_fkey (
              full_name
            )
          )
        `)
        .eq("user_id", currentUserId)
        .in("status", ["invited", "accepted"])
        .eq("call_request.status", "pending");

      if (error) throw error;
      
      console.log("Fetched invitations:", data);
      setInvitations(data as any || []);
    } catch (error: any) {
      console.error("Error fetching invitations:", error);
    }
  };

  const subscribeToInvitations = () => {
    const channel = supabase
      .channel("conference-invitations")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "video_call_participants",
          filter: `user_id=eq.${currentUserId}`,
        },
        (payload) => {
          console.log("Participant change:", payload);
          fetchInvitations();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "video_call_requests",
        },
        (payload) => {
          console.log("Call request change:", payload);
          fetchInvitations();
        }
      )
      .subscribe((status) => {
        console.log("Subscription status:", status);
      });

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

      fetchInvitations();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const joinCall = async (invitation: Invitation) => {
    try {
      // Check if all participants accepted
      const { data: participants, error: participantsError } = await supabase
        .from("video_call_participants")
        .select("status")
        .eq("call_request_id", invitation.call_request_id);

      if (participantsError) throw participantsError;

      const allAccepted = participants?.every((p) => p.status === "accepted");

      if (!allAccepted) {
        toast({
          title: "Waiting for participants",
          description: "Not all participants have accepted the invitation yet",
          variant: "default",
        });
        return;
      }

      // Update call request to active
      const { error: updateError } = await supabase
        .from("video_call_requests")
        .update({
          status: "active",
          started_at: new Date().toISOString(),
        })
        .eq("id", invitation.call_request_id);

      if (updateError) throw updateError;

      // Update participant status to joined
      const { error: joinError } = await supabase
        .from("video_call_participants")
        .update({ status: "joined" })
        .eq("id", invitation.id);

      if (joinError) throw joinError;

      setActiveCall({
        roomName: invitation.call_request.room_name,
        title: invitation.call_request.title,
      });
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
    fetchInvitations();
  };

  if (activeCall) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{activeCall.title}</CardTitle>
          <CardDescription>Conference Call</CardDescription>
        </CardHeader>
        <CardContent>
          <VideoCall
            roomName={activeCall.roomName}
            userName={currentUserName}
            onLeave={leaveCall}
          />
        </CardContent>
      </Card>
    );
  }

  if (invitations.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold flex items-center gap-2">
        <Users className="w-5 h-5" />
        Conference Call Invitations
      </h2>
      {invitations.map((invitation) => (
        <Card key={invitation.id}>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-lg">
                  {invitation.call_request.title}
                </CardTitle>
                <CardDescription>
                  Invited by {invitation.call_request.initiator.full_name}
                </CardDescription>
              </div>
              <Badge variant={invitation.status === "accepted" ? "default" : "secondary"}>
                {invitation.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              {invitation.status === "invited" ? (
                <>
                  <Button
                    onClick={() => respondToInvitation(invitation.id, "accepted")}
                    className="flex-1"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Accept
                  </Button>
                  <Button
                    onClick={() => respondToInvitation(invitation.id, "declined")}
                    variant="destructive"
                    className="flex-1"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Decline
                  </Button>
                </>
              ) : (
                <Button
                  onClick={() => joinCall(invitation)}
                  className="w-full"
                >
                  <Video className="w-4 h-4 mr-2" />
                  Join Call
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

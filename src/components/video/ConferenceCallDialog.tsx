import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Video, Users } from "lucide-react";

interface ConferenceCallDialogProps {
  currentUserId: string;
  currentUserName: string;
}

interface PotentialParticipant {
  id: string;
  full_name: string;
  role: string;
  email: string;
}

export default function ConferenceCallDialog({ currentUserId, currentUserName }: ConferenceCallDialogProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [potentialParticipants, setPotentialParticipants] = useState<PotentialParticipant[]>([]);
  const [selectedParticipants, setSelectedParticipants] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      fetchPotentialParticipants();
    }
  }, [open]);

  const fetchPotentialParticipants = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, role, email")
        .neq("id", currentUserId);

      if (error) throw error;
      setPotentialParticipants(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load participants",
        variant: "destructive",
      });
    }
  };

  const toggleParticipant = (id: string) => {
    const newSelected = new Set(selectedParticipants);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedParticipants(newSelected);
  };

  const createConferenceCall = async () => {
    if (!title.trim()) {
      toast({
        title: "Error",
        description: "Please enter a call title",
        variant: "destructive",
      });
      return;
    }

    if (selectedParticipants.size === 0) {
      toast({
        title: "Error",
        description: "Please select at least one participant",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const roomName = `conference-${currentUserId}-${Date.now()}`;

      // Create call request
      const { data: callRequest, error: callError } = await supabase
        .from("video_call_requests")
        .insert({
          initiator_id: currentUserId,
          room_name: roomName,
          title: title.trim(),
          status: "pending",
        })
        .select()
        .single();

      if (callError) throw callError;

      // Add participants
      const participantInserts = Array.from(selectedParticipants).map((userId) => ({
        call_request_id: callRequest.id,
        user_id: userId,
        status: "invited",
      }));

      const { error: participantsError } = await supabase
        .from("video_call_participants")
        .insert(participantInserts);

      if (participantsError) throw participantsError;

      console.log("Invitations sent to:", participantInserts);

      toast({
        title: "Success",
        description: "Conference call invitation sent to all participants",
      });

      setOpen(false);
      setTitle("");
      setSelectedParticipants(new Set());
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Users className="w-4 h-4" />
          Start Conference Call
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create Conference Call</DialogTitle>
          <DialogDescription>
            Invite participants to join a video conference
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Call Title</Label>
            <Input
              id="title"
              placeholder="e.g., Medical Consultation"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div>
            <Label>Select Participants</Label>
            <div className="mt-2 space-y-2 max-h-64 overflow-y-auto">
              {potentialParticipants.map((participant) => (
                <div key={participant.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={participant.id}
                    checked={selectedParticipants.has(participant.id)}
                    onCheckedChange={() => toggleParticipant(participant.id)}
                  />
                  <label
                    htmlFor={participant.id}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
                  >
                    {participant.full_name}
                    <span className="text-muted-foreground ml-2">
                      ({participant.role})
                    </span>
                  </label>
                </div>
              ))}
            </div>
          </div>

          <Button
            onClick={createConferenceCall}
            disabled={loading}
            className="w-full"
          >
            <Video className="w-4 h-4 mr-2" />
            {loading ? "Creating..." : "Send Invitations"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

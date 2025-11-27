import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, MessageCircle, User, Loader2 } from "lucide-react";
import ChatInterface from "@/components/chat/ChatInterface";

interface Conversation {
  id: string;
  participant_one: string;
  participant_two: string;
  updated_at: string;
  other_user?: {
    id: string;
    full_name: string;
    role: string;
  };
  last_message?: string;
  unread_count?: number;
}

export default function Messages() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      setCurrentUserId(user.id);

      // Fetch conversations where user is a participant
      const { data: convData, error: convError } = await supabase
        .from("chat_conversations")
        .select("*")
        .or(`participant_one.eq.${user.id},participant_two.eq.${user.id}`)
        .order("updated_at", { ascending: false });

      if (convError) throw convError;

      if (!convData || convData.length === 0) {
        setConversations([]);
        setLoading(false);
        return;
      }

      // Get other user IDs
      const otherUserIds = convData.map(conv =>
        conv.participant_one === user.id ? conv.participant_two : conv.participant_one
      );

      // Fetch profiles for other users
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, full_name, role")
        .in("id", otherUserIds);

      if (profilesError) throw profilesError;

      const profilesMap = new Map(profiles?.map(p => [p.id, p]));

      // Fetch last message and unread count for each conversation
      const conversationsWithDetails = await Promise.all(
        convData.map(async (conv) => {
          const otherId = conv.participant_one === user.id ? conv.participant_two : conv.participant_one;
          
          // Get last message
          const { data: lastMsg } = await supabase
            .from("chat_messages")
            .select("message")
            .eq("conversation_id", conv.id)
            .order("created_at", { ascending: false })
            .limit(1)
            .single();

          // Get unread count
          const { count } = await supabase
            .from("chat_messages")
            .select("*", { count: "exact", head: true })
            .eq("conversation_id", conv.id)
            .eq("read", false)
            .neq("sender_id", user.id);

          return {
            ...conv,
            other_user: profilesMap.get(otherId),
            last_message: lastMsg?.message,
            unread_count: count || 0,
          };
        })
      );

      setConversations(conversationsWithDetails);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <Button variant="ghost" onClick={() => navigate("/dashboard")} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        <div className="grid gap-6 md:grid-cols-3">
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                Conversations
              </CardTitle>
              <CardDescription>
                Your chat history
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {conversations.length === 0 ? (
                <div className="p-6 text-center">
                  <p className="text-sm text-muted-foreground">No conversations yet</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Start chatting from a patient or donor profile
                  </p>
                </div>
              ) : (
                <div className="divide-y">
                  {conversations.map((conv) => (
                    <button
                      key={conv.id}
                      onClick={() => setSelectedConversation(conv)}
                      className={`w-full p-4 text-left hover:bg-muted/50 transition-colors ${
                        selectedConversation?.id === conv.id ? "bg-muted" : ""
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="font-medium text-sm truncate">
                              {conv.other_user?.full_name || "Unknown"}
                            </p>
                            {conv.unread_count > 0 && (
                              <span className="bg-primary text-primary-foreground text-xs rounded-full px-2 py-0.5">
                                {conv.unread_count}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground capitalize">
                            {conv.other_user?.role}
                          </p>
                          {conv.last_message && (
                            <p className="text-xs text-muted-foreground truncate mt-1">
                              {conv.last_message}
                            </p>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="md:col-span-2">
            {selectedConversation && currentUserId ? (
              <ChatInterface
                recipientId={selectedConversation.other_user?.id || ""}
                recipientName={selectedConversation.other_user?.full_name || "Unknown"}
                currentUserId={currentUserId}
              />
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Select a conversation to start chatting
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

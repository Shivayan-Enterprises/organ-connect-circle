-- Create video call requests table
CREATE TABLE IF NOT EXISTS public.video_call_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  initiator_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  room_name TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'cancelled', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  started_at TIMESTAMP WITH TIME ZONE,
  ended_at TIMESTAMP WITH TIME ZONE
);

-- Create video call participants table
CREATE TABLE IF NOT EXISTS public.video_call_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  call_request_id UUID NOT NULL REFERENCES video_call_requests(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'invited' CHECK (status IN ('invited', 'accepted', 'declined', 'joined')),
  responded_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(call_request_id, user_id)
);

-- Enable RLS
ALTER TABLE public.video_call_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_call_participants ENABLE ROW LEVEL SECURITY;

-- RLS Policies for video_call_requests
CREATE POLICY "Users can view their own call requests"
  ON public.video_call_requests
  FOR SELECT
  USING (
    auth.uid() = initiator_id OR
    EXISTS (
      SELECT 1 FROM video_call_participants
      WHERE call_request_id = id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create call requests"
  ON public.video_call_requests
  FOR INSERT
  WITH CHECK (auth.uid() = initiator_id);

CREATE POLICY "Initiators can update their call requests"
  ON public.video_call_requests
  FOR UPDATE
  USING (auth.uid() = initiator_id);

-- RLS Policies for video_call_participants
CREATE POLICY "Users can view their own participations"
  ON public.video_call_participants
  FOR SELECT
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM video_call_requests
      WHERE id = call_request_id AND initiator_id = auth.uid()
    )
  );

CREATE POLICY "Initiators can add participants"
  ON public.video_call_participants
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM video_call_requests
      WHERE id = call_request_id AND initiator_id = auth.uid()
    )
  );

CREATE POLICY "Participants can update their own status"
  ON public.video_call_participants
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX idx_video_call_requests_initiator ON video_call_requests(initiator_id);
CREATE INDEX idx_video_call_requests_status ON video_call_requests(status);
CREATE INDEX idx_video_call_participants_call_request ON video_call_participants(call_request_id);
CREATE INDEX idx_video_call_participants_user ON video_call_participants(user_id);
CREATE INDEX idx_video_call_participants_status ON video_call_participants(status);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.video_call_requests;
ALTER PUBLICATION supabase_realtime ADD TABLE public.video_call_participants;
-- Add approval fields to profiles
ALTER TABLE public.profiles
ADD COLUMN approved_by_doctor BOOLEAN DEFAULT FALSE,
ADD COLUMN approved_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN approved_by UUID REFERENCES public.profiles(id);

-- Create chat_conversations table
CREATE TABLE public.chat_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_one UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  participant_two UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(participant_one, participant_two),
  CHECK (participant_one < participant_two)
);

-- Create chat_messages table
CREATE TABLE public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.chat_conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  read BOOLEAN DEFAULT FALSE
);

-- Enable RLS
ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for chat_conversations
CREATE POLICY "Users can view their own conversations"
ON public.chat_conversations
FOR SELECT
USING (auth.uid() = participant_one OR auth.uid() = participant_two);

CREATE POLICY "Users can create conversations"
ON public.chat_conversations
FOR INSERT
WITH CHECK (auth.uid() = participant_one OR auth.uid() = participant_two);

-- RLS Policies for chat_messages
CREATE POLICY "Users can view messages in their conversations"
ON public.chat_messages
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.chat_conversations
    WHERE id = conversation_id
    AND (participant_one = auth.uid() OR participant_two = auth.uid())
  )
);

CREATE POLICY "Users can send messages in their conversations"
ON public.chat_messages
FOR INSERT
WITH CHECK (
  auth.uid() = sender_id AND
  EXISTS (
    SELECT 1 FROM public.chat_conversations
    WHERE id = conversation_id
    AND (participant_one = auth.uid() OR participant_two = auth.uid())
  )
);

CREATE POLICY "Users can update their own messages"
ON public.chat_messages
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.chat_conversations
    WHERE id = conversation_id
    AND (participant_one = auth.uid() OR participant_two = auth.uid())
  )
);

-- Update profiles RLS to hide unapproved donors from patients
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

CREATE POLICY "Users can view all profiles"
ON public.profiles
FOR SELECT
USING (
  -- Everyone can see their own profile
  auth.uid() = id OR
  -- Doctors can see all profiles
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'doctor' OR
  -- Patients can see other patients
  (role = 'patient' AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'patient') OR
  -- Patients can see approved donors
  (role = 'donor' AND approved_by_doctor = TRUE AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'patient') OR
  -- Donors can see patients and other approved donors
  (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'donor' AND
    (role = 'patient' OR (role = 'donor' AND approved_by_doctor = TRUE))
  )
);

-- Enable realtime for chat
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_conversations;

-- Trigger for updated_at on conversations
CREATE TRIGGER update_chat_conversations_updated_at
BEFORE UPDATE ON public.chat_conversations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
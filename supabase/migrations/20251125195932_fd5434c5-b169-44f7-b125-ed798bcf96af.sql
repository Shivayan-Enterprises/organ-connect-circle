-- Create contact_requests table for communication between donors and patients
CREATE TABLE public.contact_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.contact_requests ENABLE ROW LEVEL SECURITY;

-- Users can view messages they sent or received
CREATE POLICY "Users can view their own contact requests"
ON public.contact_requests
FOR SELECT
USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

-- Users can create contact requests
CREATE POLICY "Users can create contact requests"
ON public.contact_requests
FOR INSERT
WITH CHECK (auth.uid() = sender_id);

-- Recipients can update status
CREATE POLICY "Recipients can update request status"
ON public.contact_requests
FOR UPDATE
USING (auth.uid() = recipient_id);

-- Create trigger for updated_at
CREATE TRIGGER update_contact_requests_updated_at
BEFORE UPDATE ON public.contact_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
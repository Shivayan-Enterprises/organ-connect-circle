-- Fix infinite recursion in video_call_requests SELECT policy
DROP POLICY IF EXISTS "Users can view their own call requests" ON video_call_requests;

CREATE POLICY "Users can view their own call requests" 
ON video_call_requests 
FOR SELECT 
USING (
  auth.uid() = initiator_id 
  OR 
  EXISTS (
    SELECT 1
    FROM video_call_participants
    WHERE video_call_participants.call_request_id = video_call_requests.id
    AND video_call_participants.user_id = auth.uid()
  )
);
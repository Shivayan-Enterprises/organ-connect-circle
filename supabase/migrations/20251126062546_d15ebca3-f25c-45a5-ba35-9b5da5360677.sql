-- Fix INSERT policy for video_call_requests
DROP POLICY IF EXISTS "Users can create call requests" ON video_call_requests;

CREATE POLICY "Users can create call requests"
ON video_call_requests
FOR INSERT
WITH CHECK (auth.uid() = initiator_id);
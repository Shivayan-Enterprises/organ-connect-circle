-- Break circular RLS dependency between video_call_requests and video_call_participants
DROP POLICY IF EXISTS "Users can view their own participations" ON video_call_participants;

CREATE POLICY "Users can view their own participations"
ON video_call_participants
FOR SELECT
USING (auth.uid() = user_id);
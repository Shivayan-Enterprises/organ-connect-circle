-- Ensure replica identity is set for video call tables
ALTER TABLE video_call_participants REPLICA IDENTITY FULL;
ALTER TABLE video_call_requests REPLICA IDENTITY FULL;
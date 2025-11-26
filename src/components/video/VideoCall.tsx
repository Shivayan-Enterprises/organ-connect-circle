import { useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PhoneOff } from "lucide-react";

interface VideoCallProps {
  roomName: string;
  userName: string;
  onLeave: () => void;
}

const VideoCall = ({ roomName, userName, onLeave }: VideoCallProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<any>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Load Jitsi Meet API
    const script = document.createElement('script');
    script.src = 'https://meet.jit.si/external_api.js';
    script.async = true;
    script.onload = () => {
      // @ts-ignore - Jitsi API
      const JitsiMeetExternalAPI = window.JitsiMeetExternalAPI;
      
      apiRef.current = new JitsiMeetExternalAPI('meet.jit.si', {
        roomName: roomName,
        parentNode: containerRef.current,
        width: '100%',
        height: '600px',
        userInfo: {
          displayName: userName,
        },
        configOverwrite: {
          startWithAudioMuted: false,
          startWithVideoMuted: false,
          enableWelcomePage: false,
          prejoinPageEnabled: false,
        },
        interfaceConfigOverwrite: {
          TOOLBAR_BUTTONS: [
            'microphone',
            'camera',
            'chat',
            'desktop',
            'fullscreen',
            'hangup',
            'participants-pane',
            'tileview',
          ],
          SHOW_JITSI_WATERMARK: false,
          SHOW_WATERMARK_FOR_GUESTS: false,
        },
      });
    };
    
    document.head.appendChild(script);

    return () => {
      if (apiRef.current) {
        apiRef.current.dispose();
      }
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [roomName, userName]);

  return (
    <Card className="w-full">
      <CardContent className="p-0">
        <div className="relative w-full">
          <div ref={containerRef} className="w-full" style={{ height: "600px" }} />
          
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
            <Button
              variant="destructive"
              size="icon"
              onClick={onLeave}
            >
              <PhoneOff className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default VideoCall;

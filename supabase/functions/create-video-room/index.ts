import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const DAILY_API_KEY = Deno.env.get('DAILY_API_KEY');
    if (!DAILY_API_KEY) {
      throw new Error('DAILY_API_KEY is not set');
    }

    const { participants } = await req.json();

    // Create a Daily.co room
    const roomResponse = await fetch('https://api.daily.co/v1/rooms', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DAILY_API_KEY}`,
      },
      body: JSON.stringify({
        properties: {
          max_participants: participants?.length || 2,
          enable_chat: true,
          enable_screenshare: false,
          exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour expiry
        }
      }),
    });

    if (!roomResponse.ok) {
      const error = await roomResponse.text();
      throw new Error(`Failed to create room: ${error}`);
    }

    const room = await roomResponse.json();

    // Generate tokens for each participant
    const tokens = [];
    if (participants && participants.length > 0) {
      for (const participant of participants) {
        const tokenResponse = await fetch('https://api.daily.co/v1/meeting-tokens', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${DAILY_API_KEY}`,
          },
          body: JSON.stringify({
            properties: {
              room_name: room.name,
              user_name: participant.name,
              is_owner: participant.is_owner || false,
            }
          }),
        });

        if (tokenResponse.ok) {
          const tokenData = await tokenResponse.json();
          tokens.push({
            userId: participant.userId,
            token: tokenData.token,
          });
        }
      }
    }

    return new Response(
      JSON.stringify({
        room_url: room.url,
        room_name: room.name,
        tokens,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

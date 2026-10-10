import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { text, voiceId = '21m00Tcm4TlvDq8ikWAM' } = await req.json(); // Default to 'Rachel'
    const apiKey = process.env.ELEVENLABS_API_KEY;

    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    if (!apiKey) {
      // Free-tier / zero-config fallback: signal browser to use Web Speech API
      return NextResponse.json({
        simulated: true,
        text,
        message: 'No ElevenLabs API key found. Fallback to client speech synthesis.'
      });
    }

    // Call live ElevenLabs API
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json',
        'Accept': 'audio/mpeg'
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_turbo_v2_5',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.8
        }
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      return NextResponse.json({
        simulated: true,
        text,
        warning: `ElevenLabs API error: ${errText}`
      });
    }

    const audioBuffer = await response.arrayBuffer();
    return new Response(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.byteLength.toString()
      }
    });

  } catch (err: any) {
    return NextResponse.json({ simulated: true, error: err.message }, { status: 500 });
  }
}

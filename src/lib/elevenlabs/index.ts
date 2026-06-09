import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import {
  ELEVENLABS_VOICE_ID,
  ELEVENLABS_MODEL_ID,
  ELEVENLABS_OUTPUT_FORMAT,
} from "@/configs";

const client = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY,
});

const SPEECH_TEMPLATE = (name: string, classname?: string) => {
  // const cleaned = name
  //   .trim()
  //   .replace(/\s+/g, " ")
  //   .toLowerCase()
  //   .replace(/\b\w/g, (c) => c.toUpperCase());
  return classname
    ? `[announce clearly, read the full name naturally]${name}. kelas ${classname} sudah di jemput`
    : `[announce clearly, read the full name naturally]${name}. sudah di jemput`;
};

export async function generateStudentSpeech(
  name: string,
  classname?: string,
): Promise<Buffer> {
  const text = SPEECH_TEMPLATE(name, classname);
  const { data: stream, rawResponse } = await client.textToSpeech
    .convert(ELEVENLABS_VOICE_ID, {
      text,
      modelId: ELEVENLABS_MODEL_ID,
      outputFormat: ELEVENLABS_OUTPUT_FORMAT,
      voiceSettings: {
        stability: 0.7,
        similarityBoost: 0.75,
        speed: 0.9,
        style: 0.1,
        useSpeakerBoost: true,
      },
    })
    .withRawResponse();

  if (rawResponse.status < 200 || rawResponse.status >= 300) {
    throw new Error(`ElevenLabs API error: ${rawResponse.status}`);
  }

  const reader = stream.getReader();
  const chunks: Buffer[] = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(Buffer.from(value));
  }

  if (chunks.length === 0) {
    throw new Error("ElevenLabs returned empty audio");
  }

  return Buffer.concat(chunks);
}

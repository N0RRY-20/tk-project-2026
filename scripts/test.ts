import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import { writeFile } from "fs/promises";
import "dotenv/config";

const elevenlabs = new ElevenLabsClient();

async function main() {
  const audio = await elevenlabs.textToSpeech.convert("U3dExJoUNcmTY5H6GMuG", {
    text: "[announcing] NAURA ELVINA RAISA HARAHAP [speaking clearly] sudah di jemput",
    modelId: "eleven_v3",
    outputFormat: "mp3_44100_128",
    voiceSettings: {
      stability: 0.7,
      similarityBoost: 0.75,
      speed: 0.9,
      style: 0.1,
      useSpeakerBoost: true,
    },
  });

  const chunks: Buffer[] = [];
  for await (const chunk of audio) {
    chunks.push(chunk);
  }

  const buffer = Buffer.concat(chunks);
  await writeFile("output.mp3", buffer);
  console.log("Audio saved to output.mp3");
}

main().catch(console.error);

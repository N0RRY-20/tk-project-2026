import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import { writeFile } from "fs/promises";
import "dotenv/config";

const elevenlabs = new ElevenLabsClient();

async function main() {
  const audio = await elevenlabs.textToSpeech.convert("JBFqnCBsd6RMkjVDRZzb", {
    text: "Tmantap banget aaaah.",
    modelId: "eleven_v3",
    outputFormat: "mp3_44100_128",
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

import { GoogleGenAI } from "@google/genai";
import fs from "node:fs/promises";
import path from "node:path";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function transcribe(fileName) {
  try {
    const filePath = path.join("logbook-transcription", "files", fileName);
    const fileBuffer = await fs.readFile(filePath);
    const base64Image = fileBuffer.toString("base64");

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          parts: [
            {
              text: `Please transcribe the following file into the following structure:

FILENAME:

DATE

AIRPORT

LOGBOOK:

NOTES:

PHOTOS: 

OTHER:

Leave any section blank if there is no info.`
            },
            {
              inlineData: {
                mimeType: "image/jpeg",
                data: base64Image,
              },
            },
          ],
        },
      ],
    });

    return response.text;
  } catch (error) {
    console.error("Error generating content:", error);
    throw error;
  }
}

async function run() {
  // Just hardcoding a filename for now to verify things work, will iterate over all files later.
  const fileName = '063.jpg';
  console.log(`Transcribing ${fileName}...`);
  
  try {
    const transcription = await transcribe(fileName);
    
    if (transcription) {
      console.log(transcription);
      
      const outputDir = path.join("logbook-transcription", "transcriptions");
      await fs.mkdir(outputDir, { recursive: true });
      
      const outputName = fileName.replace(/\.[^/.]+$/, ".txt");
      const outputPath = path.join(outputDir, outputName);
      
      await fs.writeFile(outputPath, transcription);
      console.log(`Saved transcription to ${outputPath}`);
    }
  } catch (error) {
    console.error("Failed to run transcription:", error);
  }
}

run();

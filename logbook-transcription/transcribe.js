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
              text: `Transcribe this flight logbook page into strict Markdown format. 
Follow this exact template structure. Do not deviate.

# FILENAME: ${fileName}

# DATE
[Month Year]

# AIRPORT
[Airport Name]

# SQUADRON
[Squadron Name]

# TOTALS PREVIOUS
- Day Dual: [Value]
- Day Pilot: [Value]
- Night Dual: [Value]
- Night Pilot: [Value]

# LOGBOOK ENTRIES
| Month | Date | Aircraft Type | No. | Pilot | Duty | Time |
|---|---|---|---|---|---|---|
[Logbook rows here. Use " for ditto marks if present in original.]
[Pilot will be "self" or ditto mark for all flights, transcribe as such.]
[Duty should be written with normal capitalization, not ALLCAPS.]

# TOTALS MONTH
- Day Pilot: [Value]
- Night Pilot: [Value]

# GRAND TOTAL
[Value]

# NOTES
- [Location on page]: [Content]
example: - Bottom right page next to "Convoy Patrol" (June 10th): lorem ipsum....
[Only write the date if the note seems to be relevant to that date, otherwise just write the page location.]

# PHOTOS
- [Location]: [Description]
[First include actual photos and their description, afterwards can include any text references to photos]

# OTHER
- [Signatures, stamps, assessments, etc]

If a section is empty or not present, write "None".
Do not write in allcaps, use normal capitalization.
For flight hours, use decimal points instead of dashes when transcribing (e.g. 1.15 not 1:15 or 1-15).
Transcribe everything exactly as written, do not correct any spelling or grammar.
If something is illegible, write "[illegible]" in the field or portion of the text.
Do not add conversational text. Only output the Markdown.
Use standard markdown formatting for lists and tables.
Ensure all table rows have the same number of columns.`
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
      // console.log(transcription); // Optional: print to console
      
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

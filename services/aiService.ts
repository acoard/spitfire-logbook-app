import { GoogleGenAI } from "@google/genai";
import { LogEntry } from "../types";

const API_KEY = process.env.API_KEY || ''; 

// We handle the case where API_KEY might be missing gracefully in the UI
// But per instructions, we assume it's available in the env if configured.

export const fetchHistoricalContext = async (entry: LogEntry): Promise<string> => {
  if (!API_KEY) {
    return "API Key is missing. Cannot fetch historical context.";
  }

  try {
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    
    const prompt = `
      You are an expert aviation historian specializing in RAF operations during World War II.
      
      Provide a concise (max 80 words) historical context snippet for this specific pilot logbook entry.
      Focus on the significance of the aircraft, the squadron duties at this specific time and location, or the specific operation (e.g. Overlord, Ferrying).
      
      Entry Details:
      Date: ${entry.date}
      Aircraft: ${entry.aircraftType}
      Duty: ${entry.duty}
      Location: ${entry.origin.name} to ${entry.destination?.name || 'Local'}
      Remarks: ${entry.remarks}
      
      Keep it engaging and educational.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "No context available.";
  } catch (error) {
    console.error("Error fetching AI context:", error);
    return "Unable to retrieve historical context at this time.";
  }
};
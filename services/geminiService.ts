import { GoogleGenAI } from "@google/genai";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzePdfPage = async (base64Image: string, mode: 'ocr' | 'read'): Promise<string> => {
  try {
    const modelId = 'gemini-3-flash-preview';
    
    // Convert base64 data url to raw base64 string if necessary
    const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, "");

    const prompt = mode === 'ocr' 
      ? "Extract all text from this image exactly as it appears. Maintain the layout structure where possible. Do not add any introductory or concluding remarks."
      : "Analyze the content of this document page. Provide a comprehensive summary of the key information, main topics, and any important data points. Write it in a way that can be easily read aloud.";

    const response = await ai.models.generateContent({
      model: modelId,
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Data,
              mimeType: 'image/jpeg', // Assuming placeholder images are JPEGs or similar
            },
          },
          {
            text: prompt,
          },
        ],
      },
    });

    return response.text || "No analysis could be generated.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "An error occurred while analyzing the document using AI. Please try again.";
  }
};
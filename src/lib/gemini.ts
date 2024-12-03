import { OnionLayer } from "@/types";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_API_KEY);

const defaultModel = genAI.getGenerativeModel({
  model: import.meta.env.VITE_MODAL_NAME,
});

const getDesignSuggestion = async (projectIdea: string) => {
  const prompt = `Create a detailed Project Onion design specification in JSON format for the following project idea: "${projectIdea}".
  Include the following sections:
  Please provide the response in the following format:

{
  "core": { 
    "name": string;
    "description": string;
    "components": string[];
  },
  "application": { 
    "name": string;
    "description": string;
    "components": string[];
  },
  "infrastructure": { 
    "name": string;
    "description": string;
    "components": string[];
  },
  "interface": { 
    "name": string;
    "description": string;
    "components": string[];
  },
  "external": { 
    "name": string;
    "description": string;
    "components": string[];
  }
}

Each of the keys ("core", "application", "infrastructure", "interface", and "external") should contain:
- "name" (string): The name of the layer.
- "description" (string): A brief description of the layer.
- "components" (array of strings): A list of components associated with the layer.`;

  try {
    const result = await defaultModel.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    return parseDesignResponse(text);
  } catch (error) {
    console.error("Error generating design:", error);
    throw error;
  }
};

const isOnionLayer = (obj: any): obj is OnionLayer => {
  return (
    obj != null &&
    typeof obj.name === "string" &&
    typeof obj.description === "string" &&
    Array.isArray(obj.components) &&
    obj.components.every((component: any) => typeof component === "string")
  );
};
const isValidRecordOfOnionLayers = (
  obj: any
): obj is Record<string, OnionLayer> => {
  if (typeof obj !== "object" || obj === null) return false;

  return Object.keys(obj).every((key) => isOnionLayer(obj[key]));
};

const parseDesignResponse = (
  responseText: string
): Record<string, OnionLayer> => {
  try {
    const data = JSON.parse(responseText.replace(/```json|```/g, ""));

    if (!isValidRecordOfOnionLayers(data))
      throw new Error("Invalid Response Data Format");

    return data;
  } catch (error) {
    console.error("Error parsing response:", error);
    throw error;
  }
};

export { defaultModel as model, getDesignSuggestion, parseDesignResponse };

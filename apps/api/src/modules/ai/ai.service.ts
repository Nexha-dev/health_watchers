import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '@health-watchers/config';

let clientInstance: GoogleGenerativeAI | null = null;

/**
 * Initialize and return the Gemini client
 * Throws an error if GEMINI_API_KEY is not configured
 */
function getGeminiClient(): GoogleGenerativeAI {
  if (!config.geminiApiKey) {
    throw new Error('GEMINI_API_KEY is not configured');
  }

  if (!clientInstance) {
    clientInstance = new GoogleGenerativeAI(config.geminiApiKey);
  }

  return clientInstance;
}

export interface ClinicalNotesInput {
  chiefComplaint: string;
  notes?: string;
  diagnosis?: any;
  vitalSigns?: any;
}

/**
 * Generate an AI summary of clinical notes using Google Gemini
 * @param clinicalNotes Object containing clinical information
 * @returns AI-generated summary of the clinical notes
 * @throws Error if Gemini API fails or API key is not configured
 */
export async function generateClinicalSummary(clinicalNotes: ClinicalNotesInput): Promise<string> {
  const client = getGeminiClient();

  const prompt = `You are a medical AI assistant. Provide a concise clinical summary based on the following patient encounter notes. 
Keep the summary to 2-3 sentences and focus on the most important clinical findings.

Chief Complaint: ${clinicalNotes.chiefComplaint}
${clinicalNotes.notes ? `Clinical Notes: ${clinicalNotes.notes}` : ''}
${clinicalNotes.diagnosis ? `Diagnosis: ${JSON.stringify(clinicalNotes.diagnosis)}` : ''}
${clinicalNotes.vitalSigns ? `Vital Signs: ${JSON.stringify(clinicalNotes.vitalSigns)}` : ''}

Generate a professional clinical summary:`;

  try {
    const model = client.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    return text;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    throw new Error(`Failed to generate AI summary: ${errorMessage}`);
  }
}

/**
 * Check if the AI service is available (API key is configured)
 */
export function isAIServiceAvailable(): boolean {
  return !!config.geminiApiKey;
}

export interface DrugInteractionInput {
  currentMedications: string[];
  newDrug: string;
}

export interface DrugInteractionResult {
  hasInteraction: boolean;
  severity: 'none' | 'mild' | 'moderate' | 'severe';
  recommendation: string;
}

export async function checkDrugInteractions(input: DrugInteractionInput): Promise<DrugInteractionResult> {
  const client = getGeminiClient();

  const prompt = `You are a clinical pharmacist AI. Check for drug-drug interactions between the new drug and the current medications.

Current medications: ${input.currentMedications.join(', ') || 'none'}
New drug: ${input.newDrug}

Respond ONLY with valid JSON in this exact format (no markdown):
{"hasInteraction": boolean, "severity": "none"|"mild"|"moderate"|"severe", "recommendation": "string"}`;

  const model = client.getGenerativeModel({ model: 'gemini-1.5-flash' });
  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();

  try {
    return JSON.parse(text) as DrugInteractionResult;
  } catch {
    throw new Error(`Failed to parse drug interaction response: ${text}`);
  }
}

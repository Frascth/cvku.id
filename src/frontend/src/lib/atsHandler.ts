// src/lib/atsHandler.ts
import { ats_service } from "../../../declarations/ats_service";

export async function analyzeResumeATS(resumeData) {
  try {
    const result = await ats_service.analyzeResume(resumeData);
    return result; // result bisa berisi score & checks
  } catch (error) {
    console.error("Error analyzing resume:", error);
    throw error;
  }
}

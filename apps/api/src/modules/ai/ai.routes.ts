import { Router, Request, Response } from 'express';
import { isValidObjectId } from 'mongoose';
import { generateClinicalSummary, isAIServiceAvailable, checkDrugInteractions } from './ai.service';
import { authenticate } from '../../middlewares/auth.middleware';
import logger from '../../utils/logger';
import { sendAiSummaryReadyEmail } from '@api/lib/email.service';

const router = Router();

// GET /api/v1/ai/health
router.get('/health', (_req, res) => res.json({ status: 'ok', service: 'ai' }));

// POST /api/v1/ai/summarize
// Request body: { encounterId: string }
// Returns: { success: boolean, summary: string } or error responses
router.post('/summarize', authenticate, async (req: Request, res: Response) => {
  try {
    // Check if AI service is available
    if (!isAIServiceAvailable()) {
      return res.status(503).json({
        error: 'AIUnavailable',
      });
    }

    // Validate request body
    const { encounterId } = req.body;
    if (!encounterId) {
      return res.status(400).json({
        error: 'ValidationError',
        message: 'encounterId is required',
      });
    }

    // Validate encounterId is a valid MongoDB ObjectId
    if (!isValidObjectId(encounterId)) {
      return res.status(400).json({
        error: 'ValidationError',
        message: 'Invalid encounterId format',
      });
    }

    // Lazy-import to avoid circular dependencies
    const { EncounterModel } = await import('../encounters/encounter.model');

    // Fetch the encounter
    const encounter = await EncounterModel.findById(encounterId);
    if (!encounter) {
      return res.status(404).json({
        error: 'NotFound',
        message: 'Encounter not found',
      });
    }

    // Generate clinical summary
    const summary = await generateClinicalSummary({
      chiefComplaint: encounter.chiefComplaint,
      notes: encounter.notes,
      diagnosis: encounter.diagnosis,
      vitalSigns: encounter.vitalSigns,
    });

    // Store the summary in the encounter
    encounter.aiSummary = summary;
    await encounter.save();

    // Notify attending doctor (non-blocking)
    try {
      const { UserModel } = await import('../auth/models/user.model');
      const { PatientModel } = await import('../patients/models/patient.model');
      const [doctor, patient] = await Promise.all([
        UserModel.findById(encounter.attendingDoctorId).lean(),
        PatientModel.findById(encounter.patientId).lean(),
      ]);
      if (doctor?.email && patient) {
        const patientName = `${(patient as any).firstName} ${(patient as any).lastName}`;
        sendAiSummaryReadyEmail(doctor.email, patientName, encounterId);
      }
    } catch { /* non-critical */ }

    return res.json({
      success: true,
      summary,
      encounterId,
    });
  } catch (error: any) {
    logger.error({ err: error }, 'AI summarize error');

    // Handle Gemini API specific errors
    if (error.message.includes('Failed to generate AI summary')) {
      return res.status(503).json({
        error: 'AIServiceError',
        message: 'Failed to generate AI summary. Please try again later.',
      });
    }

    return res.status(500).json({
      error: 'InternalServerError',
      message: error.message || 'An unexpected error occurred',
    });
  }
});

// POST /api/v1/ai/health-trends
// Request body: { patientId: string }
// Returns: { success: boolean, summary: string }
router.post('/health-trends', authenticate, async (req: Request, res: Response) => {
  try {
    if (!isAIServiceAvailable()) {
      return res.status(503).json({ error: 'AIUnavailable' });
    }

    const { patientId } = req.body;
    if (!patientId || !isValidObjectId(patientId)) {
      return res.status(400).json({ error: 'ValidationError', message: 'Valid patientId is required' });
    }

    const { EncounterModel } = await import('../encounters/encounter.model');
    const { PatientModel } = await import('../patients/models/patient.model');

    const [patient, encounters] = await Promise.all([
      PatientModel.findOne({ _id: patientId, clinicId: req.user!.clinicId }).lean(),
      EncounterModel.find({ patientId, clinicId: req.user!.clinicId, isActive: true })
        .sort({ createdAt: 1 })
        .select('vitalSigns createdAt')
        .lean(),
    ]);

    if (!patient) {
      return res.status(404).json({ error: 'NotFound', message: 'Patient not found' });
    }

    // Anonymize: strip PII, keep only vitals + dates
    const anonymizedVitals = encounters
      .filter((e) => e.vitalSigns && Object.keys(e.vitalSigns).length > 0)
      .map((e) => ({ date: (e as any).createdAt, vitals: e.vitalSigns }));

    if (anonymizedVitals.length === 0) {
      return res.status(422).json({ error: 'InsufficientData', message: 'No vital sign data available for trend analysis' });
    }

    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const { config } = await import('@health-watchers/config');
    const genAI = new GoogleGenerativeAI(config.geminiApiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `You are a medical AI assistant. Analyze the following anonymized vital sign history and provide a concise health trend summary in 2-3 sentences. Focus on notable patterns, improvements, or concerns.

Vital Signs History (chronological):
${JSON.stringify(anonymizedVitals, null, 2)}

Provide a professional health trend summary:`;

    const result = await model.generateContent(prompt);
    const summary = result.response.text();

    return res.json({ success: true, summary, readings: anonymizedVitals.length });
  } catch (error: any) {
    logger.error({ err: error }, 'AI health-trends error');
    return res.status(500).json({ error: 'InternalServerError', message: error.message });
  }
});

// POST /api/v1/ai/drug-interactions
// Body: { currentMedications: string[], newDrug: string }
router.post('/drug-interactions', authenticate, async (req: Request, res: Response) => {
  try {
    if (!isAIServiceAvailable()) {
      return res.status(503).json({ error: 'AIUnavailable' });
    }
    const { currentMedications, newDrug } = req.body;
    if (!newDrug || typeof newDrug !== 'string') {
      return res.status(400).json({ error: 'ValidationError', message: 'newDrug is required' });
    }
    const result = await checkDrugInteractions({
      currentMedications: Array.isArray(currentMedications) ? currentMedications : [],
      newDrug,
    });
    return res.json({ success: true, ...result });
  } catch (error: any) {
    logger.error({ err: error }, 'AI drug-interactions error');
    return res.status(500).json({ error: 'InternalServerError', message: error.message });
  }
});

export default router;

import { Request, Response, Router } from 'express';
import { authenticate } from '../../middlewares/auth.middleware';
import { EncounterModel } from './encounter.model';

const router = Router();

// POST /api/v1/encounters
router.post('/', authenticate, async (req: Request, res: Response) => {
  const clinicId = req.user?.clinicId;
  if (!clinicId) return res.status(401).json({ error: 'Unauthorized' });

  const encounter = await EncounterModel.create({ ...req.body, clinicId });
  return res.status(201).json({ status: 'success', data: encounter });
});

// GET /api/v1/encounters/:id
router.get('/:id', authenticate, async (req: Request, res: Response) => {
  const encounter = await EncounterModel.findOne({ _id: req.params.id, clinicId: req.user?.clinicId });
  if (!encounter) return res.status(404).json({ error: 'NotFound', message: 'Encounter not found' });
  return res.json({ status: 'success', data: encounter });
});

// GET /api/v1/encounters/patient/:patientId
router.get('/patient/:patientId', authenticate, async (req: Request, res: Response) => {
  const encounters = await EncounterModel.find({
    patientId: req.params.patientId,
    clinicId: req.user?.clinicId,
  }).sort({ createdAt: -1 });
  return res.json({ status: 'success', data: encounters });
});

export const encounterRoutes = router;

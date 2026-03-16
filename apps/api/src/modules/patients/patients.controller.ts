import { Request, Response, Router } from 'express';
import { authenticate } from '../../middlewares/auth.middleware';
import { PatientModel } from './patient.model';

const router = Router();

// POST /api/v1/patients
router.post('/', authenticate, async (req: Request, res: Response) => {
  const clinicId = req.user?.clinicId;
  if (!clinicId) return res.status(401).json({ error: 'Unauthorized' });

  const patient = await PatientModel.create({ ...req.body, clinicId });
  return res.status(201).json({ status: 'success', data: patient });
});

// GET /api/v1/patients/search?q=
router.get('/search', authenticate, async (req: Request, res: Response) => {
  const clinicId = req.user?.clinicId;
  const q = req.query.q as string;
  const results = await PatientModel.find({
    clinicId,
    $or: [
      { firstName: { $regex: q, $options: 'i' } },
      { lastName: { $regex: q, $options: 'i' } },
    ],
  }).limit(20);
  return res.json({ status: 'success', data: results });
});

// GET /api/v1/patients/:id
router.get('/:id', authenticate, async (req: Request, res: Response) => {
  const clinicId = req.user?.clinicId;
  const patient = await PatientModel.findOne({ _id: req.params.id, clinicId });
  if (!patient) return res.status(404).json({ error: 'NotFound', message: 'Patient not found' });
  return res.json({ status: 'success', data: patient });
});

export const patientRoutes = router;

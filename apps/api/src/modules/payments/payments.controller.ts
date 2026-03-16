import { Request, Response, Router } from 'express';
import { authenticate } from '../../middlewares/auth.middleware';
import { PaymentRecordModel } from './models/payment-record.model';
import { config } from '@health-watchers/config';
import crypto from 'crypto';

const router = Router();

// POST /api/v1/payments/intent
router.post('/intent', authenticate, async (req: Request, res: Response) => {
  try {
    const { amount } = req.body;
    const clinicId = req.user?.clinicId!;
    const intentId = crypto.randomUUID();

    const intent = {
      intentId,
      clinicId,
      amount,
      destination: config.stellar.platformPublicKey,
      memo: `hw-${intentId.slice(0, 8)}`,
      network: config.stellar.network,
    };

    await PaymentRecordModel.create({ ...intent, status: 'pending' });
    return res.json({ status: 'success', data: intent });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// GET /api/v1/payments/status/:intentId
router.get('/status/:intentId', authenticate, async (req: Request, res: Response) => {
  const record = await PaymentRecordModel.findOne({
    intentId: req.params.intentId,
    clinicId: req.user?.clinicId,
  }).lean();

  if (!record) return res.status(404).json({ error: 'NotFound', message: 'Payment intent not found' });
  return res.json({ status: 'success', data: { intentId: record.intentId, paymentStatus: record.status } });
});

export const paymentRoutes = router;

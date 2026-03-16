import { Router, Request, Response } from "express";

const router = Router();

// POST /api/v1/ai/summarize – generate AI clinical summary via Gemini
router.post("/summarize", (_req: Request, res: Response) => {
  res.status(501).json({ message: "ai summarize – not yet implemented" });
});

export default router;

import express from 'express';
import * as practiceController from '../controllers/practiceController.js';

const router = express.Router();

router.post('/start', practiceController.startPracticeSession);
router.post('/next-question', practiceController.getNextQuestion);
router.post('/submit-answer', practiceController.submitAnswer);
router.post('/:sessionId/end', practiceController.endPracticeSession);

export default router;
import express from 'express';
import documentRouter from './documentRoutes';
const router = express.Router();
router.use('/document', documentRouter);
export default router;
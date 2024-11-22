import { Router } from 'express';
import documentRouter from './documentRoutes';
const router = Router();
router.use('/document', documentRouter);
export default router;
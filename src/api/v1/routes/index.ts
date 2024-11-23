import { Router } from 'express';
import documentRouter from './documentRoutes';
import searchRouter from './searchRoutes';
const router = Router();
router.use('/document', documentRouter);
router.use('/search', searchRouter);
export default router;

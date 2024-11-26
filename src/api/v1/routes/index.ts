import { Router } from 'express';
import documentRouter from './documentRoutes';
import searchRouter from './searchRoutes';
import { lookupWord } from '../utils/wordnetHelper';
const router = Router();
router.use('/document', documentRouter);
router.use('/search', searchRouter);
router.get('/lookup/:word', async (req, res) => {
    try {
      const word = req.params.word; 
      const results = await lookupWord(word);
      res.json(results);
    } catch (error) {
      res.status(500);
    }
  });
export default router;

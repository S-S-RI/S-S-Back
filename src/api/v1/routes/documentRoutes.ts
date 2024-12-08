import express from 'express';
import {
  addDocument,
  getAllDocuments,
  searchDocuments,
  modifyDocument,
  deleteDocument,
  getDocById,
} from '../controllers/documentController';

const documentRouter = express.Router();

documentRouter.post('/add', addDocument);
documentRouter.get('/', getAllDocuments);
documentRouter.get('/:id', getDocById);
documentRouter.post('/search', searchDocuments);
documentRouter.patch('/:id', modifyDocument);
documentRouter.delete('/:id', deleteDocument);

export default documentRouter;

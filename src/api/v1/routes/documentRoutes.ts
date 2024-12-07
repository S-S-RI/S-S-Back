import express from "express";
import { addDocument, getAllDocuments, searchDocuments, modifyDocument, deleteDocument } from "../controllers/documentController";
import buildInvertedIndex from "../controllers/invertedIndexController";
import { getTermsFromDB } from "../controllers/invertedIndexController";
const documentRouter = express.Router();

documentRouter.post("/add", addDocument);
documentRouter.get("/", getAllDocuments);
documentRouter.post("/search", searchDocuments);
documentRouter.patch("/:id", modifyDocument); 
documentRouter.delete("/:id", deleteDocument); 
documentRouter.post("/invertedIndex", buildInvertedIndex)
documentRouter.get('/terms', async (req, res) => {
    try {
      const terms = await getTermsFromDB();
      res.status(200).json(terms); 
    } catch (error) {
      res.status(500).json({ error: 'Failed to retrieve terms from the database.' });
    }
  });
  
  

export default documentRouter;


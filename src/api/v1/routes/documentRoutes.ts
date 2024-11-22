import express from "express";
import { addDocument } from "../controllers/documentController";

const documentRouter = express.Router();
documentRouter.post("/add", addDocument);

export default documentRouter;


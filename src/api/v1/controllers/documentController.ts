import { Request, Response } from "express";
import { Document } from "../models/documentSchema";

export const addDocument = async (req: Request, res: Response): Promise<void> => {
  try {
    const {  content } = req.body;
    if (!content) {
      res.status(400).json({ message: "content is required." });
      return;
    }
    const document = new Document({  content });
    await document.save();

    res.status(201).json({ message: "Document added successfully", document });
  } catch (error) {
    console.error("Error adding document:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

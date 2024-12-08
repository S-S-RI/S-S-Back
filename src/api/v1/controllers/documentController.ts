import { Request, Response } from 'express';
import { Document } from '../models/documentSchema';
import Fuse from 'fuse.js';
export const addDocument = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { content } = req.body;
    if (!content) {
      res.status(400).json({ message: 'content is required.' });
      return;
    }
    const document = new Document({ content });
    await document.save();

    res.status(201).json({ message: 'Document added successfully', document });
  } catch (error) {
    console.error('Error adding document:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
export const getAllDocuments = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const documents = await Document.find();
    res.status(200).json({ documents });
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
export const searchDocuments = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { query } = req.body;

    if (!query || typeof query !== 'string') {
      res.status(400).json({ message: 'Search query is required.' });
      return;
    }
    const documents = await Document.find();
    const fuse = new Fuse(documents, {
      keys: ['content'],
      threshold: 0.5,
    });
    const results = fuse.search(query);
    const matchedDocuments = results.map((result) => result.item);
    res.status(200).json({ documents: matchedDocuments });
  } catch (error) {
    console.error('Error searching documents:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
export const modifyDocument = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    if (!id) {
      res.status(400).json({ message: 'Document ID is required.' });
      return;
    }

    if (!content) {
      res.status(400).json({ message: 'Content is required for updating.' });
      return;
    }

    const updatedDocument = await Document.findByIdAndUpdate(
      id,
      { content },
      { new: true }
    );

    if (!updatedDocument) {
      res.status(404).json({ message: 'Document not found.' });
      return;
    }

    res.status(200).json({
      message: 'Document updated successfully.',
      document: updatedDocument,
    });
  } catch (error) {
    console.error('Error updating document:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};
export const deleteDocument = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({ message: 'Document ID is required.' });
      return;
    }

    const deletedDocument = await Document.findByIdAndDelete(id);

    if (!deletedDocument) {
      res.status(404).json({ message: 'Document not found.' });
      return;
    }

    res.status(200).json({
      message: 'Document deleted successfully.',
      document: deletedDocument,
    });
  } catch (error) {
    console.error('Error deleting document:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

export const getDocById = async (req: Request, res: Response) => {
  const { id } = req.params;
  console.log('here', id);
  try {
    const doc = await Document.findById(id);
    console.log(doc);
    if (!doc) {
      res.status(404).json({ message: 'Document not found.' });
    }
    res.status(200).json(doc);
  } catch (error) {
    console.error('Error getting document by id:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

import { Request, Response } from 'express';
import { Document } from '../models/documentSchema';
import Fuse from 'fuse.js';
import getThemesOfPhrase from '../utils/getThemesOfPhrase';
import { findCollocationsOfPhrase } from '../utils/collocation';
import { normaliserEtLemmatiser } from '../utils/normaliser';
import getCollocationsandStopWords from '../utils/getCollocationsandStopWords';
export const addDocument = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { content, name } = req.body;
    if (!content) {
      res.status(400).json({ message: 'content is required.' });
      return;
    }
    const [collocationsList, stopWordsList] =
      await getCollocationsandStopWords();

    let words = await normaliserEtLemmatiser(content);
    console.log(words);

    let processedWords = await findCollocationsOfPhrase(
      words,
      collocationsList,
      stopWordsList
    );

    const themes = await getThemesOfPhrase(processedWords);
    const document = new Document({
      content: content,
      name: name,
      themes: themes,
    });
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
export const addThemesToDocuments = async (): Promise<void> => {
  try {
    const documents = await Document.find();
    for (let index = 0; index < documents.length; index++) {
      const document = documents[index];
      const [collocationsList, stopWordsList] =
        await getCollocationsandStopWords();

      let words = await normaliserEtLemmatiser(document.content);
      console.log(words);

      let processedWords = await findCollocationsOfPhrase(
        words,
        collocationsList,
        stopWordsList
      );

      const themes = await getThemesOfPhrase(processedWords);

      document.themes = themes;

      await document.save();
    }
  } catch (error) {
    console.error('Error updating documents:', error);
  }
};

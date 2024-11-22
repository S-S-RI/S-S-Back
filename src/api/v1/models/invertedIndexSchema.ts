import mongoose from 'mongoose';

const invertedIndexSchema = new mongoose.Schema({
  concept: { type: String, required: true, unique: true }, 
  documents: [
    {
      documentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Document' }, 
      tfidf: { type: Number, required: true }, 
    },
  ],
}, { timestamps: true });

export const InvertedIndex = mongoose.model('InvertedIndex', invertedIndexSchema);

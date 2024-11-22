import mongoose from 'mongoose';

const querySchema = new mongoose.Schema({
  queryText: { type: String, required: true }, 
  concepts: [String], 
  results: [
    {
      documentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Document' }, 
      similarityScore: { type: Number, required: true }, 
    },
  ],
}, { timestamps: true });

export const Query = mongoose.model('Query', querySchema);

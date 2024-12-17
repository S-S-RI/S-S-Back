import mongoose from 'mongoose';

const InvertedIndexSchema = new mongoose.Schema({
  term: { type: String, required: true },
  documentFrequency: { type: Number, required: true }, 
  postings: [
    {
      documentId: { type: mongoose.Schema.Types.ObjectId, ref: "Document", required: true },
      documentName: { type: String, required: true },
      tf: { type: Number, required: true },
      tfidf: { type: Number, required: true },
    },
  ],
});

InvertedIndexSchema.pre('save', function (next) {
  this.term = String(this.term);  // Ensure term is a string before saving
  next();
});

export const InvertedIndex = mongoose.model('InvertedIndex', InvertedIndexSchema);

import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
  },
  name: {
    type: String,
  },
  themes: {
    type: Array,
  },
});

export const Document = mongoose.model('Document', documentSchema);

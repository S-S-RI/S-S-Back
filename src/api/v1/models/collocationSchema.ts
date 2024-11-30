import mongoose from 'mongoose';

const collocationSchema = new mongoose.Schema({
  content: { type: String, required: true },
});

export const Collocation = mongoose.model('Collocation', collocationSchema);

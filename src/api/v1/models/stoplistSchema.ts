import mongoose from 'mongoose';

const stopListSchema = new mongoose.Schema({
  content: { type: String, required: true },
});

export const StopList = mongoose.model('StopList', stopListSchema);

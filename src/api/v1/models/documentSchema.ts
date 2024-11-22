import mongoose from "mongoose";

const documentSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
  },
});

export const Document = mongoose.model("Document", documentSchema);

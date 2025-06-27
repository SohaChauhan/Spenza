import mongoose from "mongoose";

const CategorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  type: {
    type: String,
    enum: ["income", "expense", "both"],
    required: true,
  },
  icon: {
    type: String, // lucide icon name
  },
  color: {
    type: String, // optional Tailwind color class
  },
});

export default mongoose.models.Category ||
  mongoose.model("Category", CategorySchema);

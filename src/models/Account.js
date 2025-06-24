import mongoose from "mongoose";

const AccountSchema = new mongoose.Schema(
  {
    name: { type: String, required: true }, // e.g., HDFC Bank
    type: { type: String, required: true }, // e.g., Bank, Cash, Credit
    balance: { type: Number, required: true, default: 0 },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserModel",
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Account ||
  mongoose.model("Account", AccountSchema);

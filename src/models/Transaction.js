import mongoose from "mongoose";

const TransactionSchema = new mongoose.Schema(
  {
    type: { 
      type: String, 
      enum: ["income", "expense", "transfer"], 
      required: true 
    },
    category: { 
      type: String, 
      required: function() { 
        return this.type !== 'transfer'; 
      } 
    },
    amount: { 
      type: Number, 
      required: true 
    },
    accountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: function() {
        return this.type !== 'transfer';
      }
    },
    fromAccountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: function() {
        return this.type === 'transfer';
      }
    },
    toAccountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: function() {
        return this.type === 'transfer';
      }
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserModel",
      required: true,
    },
    note: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.Transaction ||
  mongoose.model("Transaction", TransactionSchema);

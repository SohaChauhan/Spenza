import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true },
    password: String,
    image: String,
  },
  { timestamps: true }
);

export default mongoose.models.UserModel ||
  mongoose.model("UserModel", UserSchema);

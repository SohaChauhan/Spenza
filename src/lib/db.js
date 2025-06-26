import mongoose from "mongoose";

export async function connectToDatabase() {
  try {
    const client = await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");
  } catch (err) {
    console.log(err.message);
  }
}

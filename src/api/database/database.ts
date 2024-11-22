import mongoose from "mongoose";
mongoose.set("strictQuery", false);
const mongoDBURL = process.env.DB_URL ;
if (!mongoDBURL) {
  throw new Error(
    "MongoDB connection URL is not defined in environment variables."
  );
}
async function main() {
  try {
    await mongoose.connect(mongoDBURL as string); 
    console.log("MongoDB connection established successfully!");
  } catch (err) {
    console.error("Error connecting to MongoDB:", err);
  }
}
main().catch((err) => console.log(err));

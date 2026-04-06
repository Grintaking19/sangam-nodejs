import mongoose from "mongoose";

const connectToDB = async () => {
  try {
    await mongoose.connect(process.env.DB_CONNECTION, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
    });
    console.log("MongoDB connected successfully.");
  } catch (e) {
    console.error("MongoDB connection failed", e);
    process.exit(1);
  }
};

const disconnectDB = async () => {
  await mongoose.connection.close();
  console.log("MongoDB disconnected.");
};

export { connectToDB, disconnectDB };

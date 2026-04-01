import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
console.log(process.env.DB_CONNECTION);
mongoose
  .connect(process.env.DB_CONNECTION)
  .then(() => {
    console.log("database connected successfully");
  })
  .catch((e) => {
    console.log(e);
  });

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  age: Number,
  isActive: Boolean,
  tags: [String],
  createdAt: { type: Date, default: Date.now },
});

// Create user model
const User = mongoose.model("User", userSchema);

async function runQueryExamples() {
  try {
    // // create a new document
    // const newUser = await User.create({
    //   name: "user1",
    //   email: "user1@example.com",
    //   age: 18,
    //   isActive: true,
    //   tags: ["man made from steel", "GG well played ya habibi"],
    // });

    
    console.log(`Created a new User ${newUser}`);
  } catch (e) {
    console.log("Error ->", e);
  } finally {
    await mongoose.connection.close();
  }
}

runQueryExamples();

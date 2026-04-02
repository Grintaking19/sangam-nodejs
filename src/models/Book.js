import mongoose from "mongoose";

const BookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Book title is required"],
    trim: true,
    maxLength: [100, "Book title can't exceed 100 characters"],
  },
  author: {
    type: String,
    required: [true, "Author name is required"],
    trim: true,
  },
  year: {
    type: Number,
    required: [true, "Year of publication is required"],
    min: [1, "Are you really trying to go BCE!"],
    max: [new Date().getFullYear(), "Year can't be in the future"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const BookModel = mongoose.model("Book", BookSchema);

export default BookModel;

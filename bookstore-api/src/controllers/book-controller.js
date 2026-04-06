import Book from "../models/Book.js";
import handleBadRequest from "../utils/handleBadRequest.js";
const getAllBooks = async (req, res) => {
  try {
    const allBooks = await Book.find({});
    if (allBooks?.length > 0) {
      res.status(200).json({
        success: true,
        message: "All Books have been fetched!",
        data: allBooks,
      });
    } else {
      res.status(404).json({
        success: false,
        message: "No Books have been found!",
      });
    }
  } catch (e) {
    handleBadRequest(e, res);
  }
};

const getBookByID = async (req, res) => {
  try {
    const bookID = req.params.id;
    const bookFound = await Book.findById(bookID);
    if (!bookFound) {
      return res.status(404).json({
        success: false,
        message: "Book with current ID doesn't exist, please change ID!",
      });
    }
    res.status(200).json({
      success: true,
      data: bookFound,
    });
  } catch (e) {
    handleBadRequest(e, res);
  }
};

const addBook = async (req, res) => {
  try {
    const bookForm = req.body;
    const createdBook = await Book.create(bookForm);
    if (createdBook) {
      res.status(201).json({
        success: true,
        message: "Book added successfully",
        data: createdBook,
      });
    } else {
      console.error("Book failed to be created", e);
      res.status(400).json({
        success: false,
        message: "Request Failed!",
      });
    }
  } catch (e) {
    handleBadRequest(e, res);
  }
};

const updateBook = async (req, res) => {
  try {
    const bookID = req.params.id;
    const bookData = req.body;
    const newUpdatedBook = await Book.findByIdAndUpdate(bookID, bookData, {
      returnDocument: "after",
    });
    if (!newUpdatedBook) {
      return res.status(404).json({
        success: false,
        message: "Book Not Found, Check ID",
      });
    }
    res.status(200).json({
      success: true,
      message: "Book was updated succussfully.",
      data: newUpdatedBook,
    });
  } catch (e) {
    handleBadRequest(e, res);
  }
};

const deleteBook = async (req, res) => {
  try {
    const bookID = req.params.id;
    const deletedBookData = await Book.findByIdAndDelete(bookID);
    if (!deletedBookData) {
      return res.status(404).json({
        success: false,
        message: "Book Not Found, Check ID",
      });
    }
    res.status(200).json({
      success: true,
      message: "Book was deleted successfully.",
      data: deletedBookData,
    });
  } catch (e) {
    handleBadRequest(e, res);
  }
};

export { getAllBooks, getBookByID, addBook, updateBook, deleteBook };

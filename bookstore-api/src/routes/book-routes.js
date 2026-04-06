import express from "express";
import {
  getAllBooks,
  getBookByID,
  addBook,
  updateBook,
  deleteBook,
} from "../controllers/book-controller.js";
// Create express router
const router = express.Router();

// Routes related to books only
router.get("/get", getAllBooks);
router.get("/get/:id", getBookByID);
router.post("/add", addBook);
router.put("/update/:id", updateBook);
router.delete("/delete/:id", deleteBook);

export default router;

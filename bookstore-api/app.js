import express from "express";

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Mock Data
let books = [
  { id: 1, title: "The Great Gatsby", author: "F. Scott Fitzgerald" },
  { id: 2, title: "To Kill a Mockingbird", author: "Harper Lee" },
  { id: 3, title: "1984", author: "George Orwell" },
  { id: 4, title: "Pride and Prejudice", author: "Jane Austen" },
  { id: 5, title: "The Catcher in the Rye", author: "J.D. Salinger" },
];

// Get all our Books
app.get("/", (req, res) => {
  res.json({
    message: "Welcome to our bookstore api",
  });
});

app.get("/books", (req, res) => {
  res.json(books);
});

app.get("/books/:id", (req, res) => {
  const getSingleBookId = books.find(
    (book) => book.id === parseInt(req.params.id),
  );
  if (getSingleBookId) {
    res.json(getSingleBookId);
  } else {
    res.status(404).json({
      message: "Book Not Found",
    });
  }
});

// Create a new Book
app.post("/books", (req, res) => {
  const newBook = req.body;
  newBook.id = crypto.randomUUID();
  books.push(newBook);
  res.status(200).json({
    status: "success",
    data: newBook,
  });
});

// Update a book
app.put("/books/:id", (req, res) => {
  const getSingleBook = books.find(
    (item) => item.id === parseInt(req.params.id),
  );
  if (getSingleBook) {
    const title = req.body?.title || getSingleBook.title;
    const author = req.body?.author || getSingleBook.author;
    res.status(200).json({
      status: "success",
      data: {
        id: getSingleBook.id,
        title: title,
        author: author,
      },
    });
  } else {
    res.status(404).json({
      message: "Book Not Found, Check the ID",
    });
  }
});

// Delete a book
app.delete("/books/:id", (req, res) => {
  const getSingleBook = books.find(
    (item) => item.id === parseInt(req.params.id),
  );
  if (getSingleBook) {
    const newBooks = books.filter((book) => book.id !== getSingleBook.id);
    res.status(200).json({
      status: "success",
      data: newBooks,
    });
  } else {
    res.status(404).json({ message: "Book you Want to delete is Not Found" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

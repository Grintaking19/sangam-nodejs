import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create a new directory
const newDirPath = path.join(__dirname, "data");

if (!fs.existsSync(newDirPath)) {
  fs.mkdirSync(newDirPath);
  console.log("Data directory created successfully.");
}

// Create .txt file
const filePath = path.join(newDirPath, "text-file.txt");
fs.writeFileSync(filePath, "Hello World Ya sadeky");

console.log("Text file created successfully.");

// Read from .txt file
const readFileContent = fs.readFileSync(filePath, "utf-8");
console.log("File content:", readFileContent);

// Append a new data into the file
fs.appendFileSync(
  filePath,
  "\nThis is a new line appended to the text file ya sadeky:D",
);
console.log("New text appended successfully");

// Async way of doing fs operations
const asyncFilePath = path.join(newDirPath, "async-text-file.txt");
fs.writeFile(
  asyncFilePath,
  "Hello World, from Async operation ya sadeky",
  (err) => {
    if (err) {
      throw err;
    }
    console.log("Async file is created successfully.");

    //Now we want to read file async (Callback hell, here we go)
    fs.readFile(asyncFilePath, "utf-8", (err, data) => {
      if (err) {
        throw err;
      }
      console.log("Async file content:", data);

      fs.appendFile(
        asyncFilePath,
        "\nThis is a new line in the Async text file.",
        (err) => {
          if (err) {
            throw err;
          }
          console.log("New Text appended successfuly to Async file");
          fs.readFile(asyncFilePath, "utf-8", (err, data) => {
            if (err) {
              throw err;
            }
            console.log("Async file content:", data);
          });
        },
      );
    });
  },
);

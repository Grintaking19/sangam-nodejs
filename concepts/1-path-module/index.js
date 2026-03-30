import path from "path";
import { fileURLToPath } from "url";

// Get the base name of the file
const __filename = fileURLToPath(import.meta.url);

console.log("Base Name:", path.basename(__filename));

// Get the directory name of the file
console.log("Directory Name:", path.dirname(__filename));

// Get the file extension
console.log("File Extension:", path.extname(__filename));

// Join multiple path segments
const joinedPath = path.join("folder1", "folder2", "file.txt");
console.log("Joined Path:", joinedPath);

// Normalize a path (Means resolving the path by removing redundant segments like '.' and '..')
const normalizedPath = path.normalize("folder1/../folder2/./file.txt");
console.log("Normalized Path:", normalizedPath);

// Resolve a sequence of paths into an absolute path
const resolvedPath = path.resolve("sangam-nodejs", "index.js");
console.log("Resolved Path:", resolvedPath);

// Parse a path into its components (Parsing a path returns an object with properties like root, dir, base, ext, and name)
const parsedPath = path.parse(__filename);
console.log("Parsed Path:", parsedPath);

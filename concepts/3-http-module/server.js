import http from "http";

const server = http.createServer((req, res) => {
  console.log("Server is Initialized");
  console.log("req", req);
  res.writeHead(200, { "content-type": "text/plain" });
  res.end("Hello World, from Node.js HTTP module");
});

const port = 3000;
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

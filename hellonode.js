// Load http module
const http = require("http");
const hostname = '127.0.0.1';
const port = 3000;

// Create http server and listen on port 3000 for requests
const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', "text/plain");
  res.end("Hello World!\n");
});

server.listen(port, hostname, () => {
  console.log(`Server running at https://${hostname}:${port}`);
});

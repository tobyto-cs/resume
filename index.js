require('dotenv').config();
const http = require("http");
const fs = require('fs');
const path = require('path');
const tbrouter = require('tbrouter');
const send = require('send');

const router = tbrouter.router;

const logger = require('./utils/logger.js');
const app = tbrouter.controller();

const myRouter = require('./src/routers/testRouter.js');

const HOSTNAME = process.env.HOSTNAME || '127.0.0.1';
const PORT = process.env.PORT || 3000;


// Custom Middleware
const sendFileMW = (req, res, next) => {
  res.sendFile = function(filepath) {
    if (fs.existsSync(filepath)) {
      res.writeHead(200, {'Content-Type': 'text/html' });
      fs.createReadStream(filepath).pipe(res);
    }
  }
  return next();
}

const static = (fpath) => {
  return (req, res, next) => {
    let fp = path.join(fpath, req.url)
    if (fs.existsSync(fp) && !fs.lstatSync(fp).isDirectory()) {
      fs.createReadStream(fp).pipe(res);
      res.end();
    }
    return next();
  }
}

// Middleware
app.use(static('public/'))
app.use(sendFileMW);


// Routes
app.use('/api', myRouter);
app.get('/testing', (req, res) => {
  res.end("TEstiung")
})
app.get('/', (req, res) => {
  res.sendFile('public/index.html')
  //res.writeHead(200, { 'content-type': 'text/html' });
  //fs.createReadStream('public/index.html').pipe(res);
})


// Start listening
app.listen(PORT, HOSTNAME);
logger.info(`Server running at ${HOSTNAME}:${PORT}`);



require('dotenv').config();
const http = require("http");
const fs = require('fs');
const path = require('path');
const tbrouter = require('tbrouter');

const router = tbrouter.router;

const logger = require('./utils/logger.js');
const app = tbrouter.controller();

const myRouter = require('./src/routers/testRouter.js');

const HOSTNAME = process.env.HOSTNAME || '127.0.0.1';
const PORT = process.env.PORT || 3000;

const sendFileMW = (req, res, next) => {
  res.sendFile = function(filepath) {
    if (fs.existsSync(filepath)) {
      res.writeHead(200, {'Content-Type': 'text/html' });
      fs.createReadStream(filepath).pipe(res);
    }
  }
  next();
}

app.use('/api', myRouter);

app.get('/testing', (req, res) => {
  res.end("TEstiung")
})

app.use(sendFileMW);

app.get('/', (req, res) => {
  res.sendFile('public/index.html')
  //res.writeHead(200, { 'content-type': 'text/html' });
  //fs.createReadStream('public/index.html').pipe(res);
})

app.listen(PORT, HOSTNAME);
logger.info(`Server running at ${HOSTNAME}:${PORT}`);



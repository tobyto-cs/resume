require('dotenv').config();
const http = require("http");
const fs = require('fs');
const path = require('path');
const tbrouter = require('tbrouter');
const send = require('send');

// dev dependencies
const connectLivereload = require('connect-livereload');
const livereload = require('livereload');

const logger = require('./utils/logger.js');
const app = tbrouter.controller(logger);

// custom router test
const myRouter = require('./src/routers/testRouter.js');

// env variables
const HOSTNAME = process.env.HOSTNAME || '127.0.0.1';
const PORT = process.env.PORT || 3000;
const WORKENV = process.env.WORKENV;

global.__basedir = path.resolve(__dirname);


logger.info(`Working in ${WORKENV} enviroment`);

// dev env specifics
if (WORKENV === "dev") {
  const lrServer = livereload.createServer();
  lrServer.watch(path.join(global.__basedir, "public"));
  lrServer.server.once("connection", () => {
    setTimeout(() => {
      lrServer.refresh("/");
    }, 100);
  });

  // dev middleware to connect livereload
  app.use(connectLivereload());
}

// Custom Middleware
const sendFileMW = (req, res, next) => {
  res.sendFile = function(filepath) {
      if (fs.existsSync(filepath) && !fs.lstatSync(filepath).isDirectory()) {
        // get the ContentType
        let extname = String(path.extname(filepath)).toLowerCase();
        let fileTypes = {
          '.html': 'text/html',
          '.js': 'text/javascript',
          '.css': 'text/css',
          '.json': 'application/json',
          '.png': 'image/png',
          '.jpg': 'image/jpg',
          '.gif': 'image/gif',
          '.svg': 'image/svg+xml',
          '.wav': 'audio/wav',
          '.mp4': 'video/mp4',
          '.woff': 'application/font-woff',
          '.ttf': 'application/font-ttf',
          '.eot': 'application/vnd.ms-fontobject',
          '.otf': 'application/font-otf',
          '.wasm': 'application/wasm'
        };
        let contentType = fileTypes[extname] || 'application/octet-stream';
        let content = fs.readFileSync(filepath, {encoding: 'utf-8', flag: 'r'});
        res.writeHead(200, { 'Content-Type': contentType });
        if (logger) logger.debug("Sending file "+filepath);
        res.end(content, 'utf-8');
    } else {
      res.writeHead(500, {'Content-Type': 'text/html' });
      res.end('<b>500, Server File not found</b>');
      logger.error(`File does not exist: ${filepath}`)
    }
  }
  return next();
}

// Middleware
app.use(tbrouter.static(path.join(global.__basedir, 'public/'), logger));
app.use(sendFileMW);


// Routes
app.use('/api', myRouter);
app.get('/testing', (req, res) => {
  res.end("TEstiung")
})

app.get('/', (req, res) => {
  logger.debug("Sending index file");
  res.sendFile('public/index.html')
  //res.writeHead(200, { 'content-type': 'text/html' });
  //fs.createReadStream('public/index.html').pipe(res);
})

app.get('/resume', (req, res) => {
  res.sendFile('public/resume.html')
})

app.get('/projects', (req, res) => {
  res.sendFile('public/projects.html')
})

// Start listening
app.listen(PORT, HOSTNAME);
logger.info(`Server running at ${HOSTNAME}:${PORT}`);



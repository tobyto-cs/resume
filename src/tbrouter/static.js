const fs = require('fs');
const path = require('path');
const url = require('url');

// middleware function to provide static resources
// from dir fp
module.exports = (fpath, logger=null) => {
  if (fs.existsSync(fpath) && fs.lstatSync(fpath).isDirectory()) {
    if (logger) logger.verbose("Added static resources: " + fpath);
    return (req, res, next) => {
      let fp = path.join(fpath, url.parse(req.url).pathname)
      // check if it exists and is not a directory
      if (fs.existsSync(fp) && !fs.lstatSync(fp).isDirectory()) {
        let extname = String(path.extname(fp)).toLowerCase();
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

        let content = fs.readFileSync(fp, {encoding: 'utf-8', flag: 'r'});
        res.writeHead(200, { 'Content-Type': contentType });
        if (logger) logger.debug("Serving static "+fp);
        res.end(content, 'utf-8');
      } else {
        return next();
      }
    }
  } else {
    if (logger) logger.error("Invalid static path: " + JSON.stringify(fpath));
  }
}


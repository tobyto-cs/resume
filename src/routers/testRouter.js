const tbrouter = require('tbrouter')
const logger = require('../../utils/logger.js')

let myRouter = tbrouter.router();

const sendMW = (req, res, next) => {
  res.send = function(msg) {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end(msg);
  }
  next();
}

myRouter.use(sendMW);

myRouter.get('/testing', (req, res) => {
  res.send('API Testing');
});

module.exports = myRouter

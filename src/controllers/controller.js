const http = require('http');
const fs = require('fs');

const Router = require('./router.js');
const logger = require('../../utils/logger.js');

// TODO: Setup static errorpage routes that server a page
module.exports = (() => {
  const mainRouter = new Router();
  
  const usehandler = (url, method) => {
    if (method && method.isRouter) {
      method.url = url;
      mainRouter.add(method);
    } else mainRouter.use(url);
  }

  const controller = () => {
    const get = (route, handler) => mainRouter.add('GET', route, handler);
    const post = (route, handler) => mainRouter.add('POST', route, handler);
    const use = (url, method) => usehandler(url, method);

    const listen = (port, host) => {
      http.createServer((req, res) => {
        // Runs req, res through the middleware, then runs router()
        mainRouter.route(req, res);

      }).listen(port, host);
    };

    return {
      get,
      post,
      listen,
      use
    };
  };

  return controller;
})();

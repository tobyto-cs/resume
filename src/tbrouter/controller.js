const http = require('http');
const fs = require('fs');

const Router = require('./router.js');
const logger = require('../../utils/logger.js');

const url = require('url');

module.exports = (() => {
  const usehandler = (url, method, router) => {
    if (method && method.isRouter) {
      method.url = url;
      router.add(method);
    } else router.use(url);
  }

  const controller = (logger=null) => {
    const mainRouter = new Router(logger);
    const get = (route, handler) => mainRouter.add('GET', route, handler);
    const post = (route, handler) => mainRouter.add('POST', route, handler);
    const use = (url, method) => usehandler(url, method, mainRouter);

    // Just starts the routing process
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

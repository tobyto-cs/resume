const logger = require('../../utils/logger.js');
const http = require('http');

function Router() {
  this.sroutes = [];
  this.droutes = [];
  this.mw = [];

  this.url = '';
  this.isRouter = true;
}

// Helper to bind the next middleware to the first's arguements
function bindMiddleware(fn, next_arg) {
  if (next_arg) return function(req, res) {
    return fn(req, res, next_arg.bind(fn, req, res));
  }
  else return function(req, res) {
    return fn(req, res, () => {  })
  }
}

// middleware is a function that takes (req, res, next)
// next is generated from bindMiddleware
function addMiddleware(middleware) {
  if (!typeof middleware === 'function') {
    logger.verbose(`Invalid middleware, not a function`, { function: middleware.name });
  }
  this.mw.unshift(bindMiddleware(middleware, this.mw[0]));
  logger.verbose(`Added ${middleware.name=='' ? 'AnonymousFunc' : middleware.name} to middleware stack`, { function: middleware.name });
}

// Route adders
function addStaticRoute(method, url, handler) {
  this.sroutes.push({ method, url, handler });
  logger.verbose(`Added static route ${method}: ${url}`);
}
function addDynamicRoute(router) {
  this.droutes.push({ router, url: router.url });
  logger.verbose(`Added dynamic route for ${router.url}`);
}

// returns a handler for the route (if one is found)
function findRoute(req, res) {
  let method = req.method.toUpperCase();
  let url = req.url.toLowerCase();

  // first check for dynamic routers
  logger.debug(`Finding route for ${url}`);

  let route = this.droutes.find(route => { return url.startsWith(route.url); });
  if (route) {
    logger.debug(`  Found dynamic route: ${route.url}${url.replace(route.url, '')}`);
    req.url = req.url.replace(route.url, '');
    return route;
  }
  // then check for static routers
  else {
    logger.debug(`  Found static route: ${url}`);
    return this.sroutes.find(route => route.method === method && route.url === url);
  }
}

function startRoute(req, res) {
  // Start the middleware chain
  this.mw[0](req, res);

  let method = req.method.toUpperCase();
  let url = req.url.toLowerCase();
  let route = findRoute.call(this, req, res);

  if (route) {
    if (route.router && route.router.isRouter) return route.router.route(req, res);
    else return route.handler(req, res);
  } else {
    res.writeHead(404, { 'Content-Type': 'text/html' });
    res.end("<b>404, Route Not Found</b>");
  }
}

function addHandler(method, url, handler) {
  if (method && method.isRouter) addDynamicRoute.call(this, method);
  else addStaticRoute.call(this, method, url, handler);
}


Router.prototype.route = function(req, res) { return startRoute.call(this, req, res); }
Router.prototype.add = function(method, url, handler) { return addHandler.call(this, method, url, handler); }
Router.prototype.use = function(middleware) { return addMiddleware.call(this, middleware); }
Router.prototype.get = function(route, handler) { return addHandler.call(this, 'GET', route, handler); }
Router.prototype.post = function(route, handler){ return addHandler.call(this, 'POST', route, handler); }


module.exports = Router;

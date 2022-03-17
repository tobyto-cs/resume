const http = require('http');

function Router(logger=null) {
  this.sroutes = [];
  this.droutes = [];
  this.mw = [];

  this.url = '';
  this.isRouter = true;
  this.logger = logger;
}

function next(next_fn, req, res, err) {
  if (err) {
    if (this.logger) this.logger.error(err);
  } else {
    return fn.bind(req, res);
  }
}

// Helper to bind the next middleware to the first's arguements
function bindMiddleware(fn, next_fn) {
  if (next_fn) return function(req, res) {
    return fn(req, res, (err) => {
      if (err) {
        return err;
      } else {
        return next_fn(req, res);
      }
    });
  }
  else return function(req, res) {
    return fn(req, res, () => { if (this.logger) logger.debug("End of middleware"); return; })
  }
}

// middleware is a function that takes (req, res, next)
// next is generated from bindMiddleware
function addMiddleware(middleware) {
  if (!typeof middleware === 'function') {
    if (this.logger) this.logger.verbose(`Invalid middleware, not a function`, { function: middleware.name });
  }
  this.mw.unshift(bindMiddleware(middleware, this.mw[0]));
  if (this.logger) this.logger.verbose(`Added ${middleware.name=='' ? 'AnonymousFunc' : middleware.name} to middleware stack`, { function: middleware.name });
}

// Route adders
function addStaticRoute(method, url, handler) {
  this.sroutes.push({ method, url, handler });
  if (this.logger) this.logger.verbose(`Added static route ${method}: ${url}`);
}
function addDynamicRoute(router) {
  this.droutes.push({ router, url: router.url });
  if (this.logger) this.logger.verbose(`Added dynamic route for ${router.url}`);
}

// returns a handler for the route (if one is found)
function findRoute(req, res) {
  let method = req.method.toUpperCase();
  let url = req.url.toLowerCase();

  // first check for dynamic routers
  if (this.logger) this.logger.debug(`Finding route for ${url}`);

  let route = this.droutes.find(route => { return url.startsWith(route.url); });
  if (route) {
    if (this.logger) this.logger.debug(`  Found dynamic route: ${route.url}${url.replace(route.url, '')}`);
    req.url = req.url.replace(route.url, '');
    return route;
  }
  // then check for static routers
  else {
    let sroute = this.sroutes.find(route => route.method === method && route.url === url);
    if (sroute) {
      if (this.logger) this.logger.debug(`  Found static route: ${url}`);
      return sroute
    } else {
      if (this.logger) this.logger.debug(`  404 Route not found: ${url}`)
    }
  }
}

function startRoute(req, res) {
  // Start the middleware chain
  let err = this.mw[0](req, res);

  if (err) {
    res.writeHead(500);
    res.end("500, Internal server error");
    if (this.logger) this.logger.error("Route error: "+err);
    return;
  }
  
  // check if middleware sent res
  if (res.headersSent || res.writableEnded) {
    if (this.logger) this.logger.verbose("Response sent, not checking routes");
    return;
  }

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

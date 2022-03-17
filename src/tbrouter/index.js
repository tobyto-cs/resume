const app = require('./controller.js');
const Router = require('./router.js');
const static = require('./static.js');

const controller = (logger=null) => {
  return app(logger);
}
const router = (logger=null) => {
  return new Router(logger);
}

module.exports = {
  controller,
  router,
  static
}
// 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

const app = require('./controller.js');
const Router = require('./router.js');

const controller = () => {
  return app();
}

const router = () => {
  return new Router();
}

module.exports = {
  controller,
  router
}

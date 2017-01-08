const Router = require('express').Router;

module.exports = () => {
  const router = new Router();

  function createHandler(method) {
    return function handler(path, fun) {
      return router[method](path, (req, res, next) => {
        const p = fun(req, res, next);
        if (!p.then || !p.catch || !p.done) {
          console.error(
            'Expected then handler for route %s to be async',
            req.url,
          );
        }

        p.catch(next).done();
      });
    };
  }

  router.getAsync = createHandler('get');
  router.postAsync = createHandler('post');
  router.deleteAsync = createHandler('delete');
  router.putAsync = createHandler('put');

  return router;
};


const Router = require('express').Router;

/**
 * A helper for `createNamedAsyncMiddleware`
 * If the function already has a name, we'll just use that and tack
 * `Async` on the end. If the function doesn't have a name we'll
 * use the path for the target handler plus the index of the current
 * middleware.
 */
function getFunctionName(fun, handlerPath, middlewareIndex) {
  if (fun.name && fun.name !== 'anonymous') {
    return fun.name + 'Async';
  }

  // Path can be a string, regex, or array of either
  const strPath = handlerPath.toString();

  return strPath + middlewareIndex;
}

/**
 * The number of arugments that a function takes matters in express
 * if a middleware takes 4 arguments, express treats it as an error
 * middleware
 */
function createErrorOrNormalMiddleware(fun) {
  if (fun.length === 4) {
    return (err, req, res, next) => {
      // Execute the function
      const p = fun(err, req, res, next);

      // If the result isn't a promise
      if (!p || typeof p !== 'object' || !p.then || !p.catch) {
        console.error(
          'Expected then middleware number %d for route %s to return a promise',
          i,
          req.url,
        );

        return;
      }

      // catch the error and pass it to the next error handling middleware
      const pp = p.catch(next);
      if (pp.done) {
        // Terminate promise for bluebird and Q
        pp.done();
      }
    };
  }

  return (req, res, next) => {
    // Execute the function
    const p = fun(req, res, next);

    // If the result isn't a promise
    if (!p || typeof p !== 'object' || !p.then || !p.catch) {
      console.error(
        'Expected then middleware number %d for route %s to return a promise',
        i,
        req.url,
      );

      return;
    }

    // catch the error and pass it to the next error handling middleware
    const pp = p.catch(next);
    if (pp.done) {
      // Terminate promise for bluebird and Q
      pp.done();
    }
  };
}

/**
 * Create a middleware which calls the original function but catches
 * unhandled promise rejections (either from async functions or returned promise)
 * and passes the error to `next` which will call the next error handler middleware.
 *
 * For better stack traces we want to make sure that the functions are
 * named function for each middleware the simplest to have a dynamic
 * function.name is to initialize it in an object with the key being
 * the dynamic function name
 */
function createNamedAsyncMiddleware(fun, handlerPath, middlewareIndex) {
  const functionName = getFunctionName(fun, handlerPath, middlewareIndex);

  return {
    [functionName]: createErrorOrNormalMiddleware(fun),
  }[functionName];
}

function createAsyncRouter(options) {
  const router = new Router(options);

  function createHandler(method) {
    return function handler(path, ...rest) {
      const asyncRest = rest.map((fun, i) =>
        createNamedAsyncMiddleware(fun, path, i),
      );

      return router[method](path, ...asyncRest);
    };
  }

  router.getAsync = createHandler('get');
  router.postAsync = createHandler('post');
  router.deleteAsync = createHandler('delete');
  router.putAsync = createHandler('put');

  return router;
}

module.exports = createAsyncRouter;

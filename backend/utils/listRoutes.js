module.exports = function listRoutes(app) {
  const routes = [];

  // Express 5 router location
  const root =
    (app && app.router && app.router.stack) ||
    (app && app._router && app._router.stack);

  if (!root) return routes;

  function walk(stack, prefix = "") {
    stack.forEach((layer) => {
      // If this is a direct route
      if (layer.route) {
        const methods = Object.keys(layer.route.methods)
          .map((m) => m.toUpperCase())
          .join(", ");

        routes.push({
          path: prefix + layer.route.path,
          methods,
        });
      }

      // If this is a nested router
      const sub = layer.handle?.stack || layer.handler?.stack;
      if (sub) walk(sub, prefix);
    });
  }

  walk(root);
  return routes;
};

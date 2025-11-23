module.exports = function listRoutes(app) {
  const routes = [];

  // Express 5 router location
  const root =
    (app && app.router && app.router.stack) ||
    (app && app._router && app._router.stack);

  if (!root) return routes;

  function classifyRoute(path) {
    if (path.startsWith("/api/auth")) return "Auth Route";
    if (path.startsWith("/api/users")) return "User Route";
    if (path.startsWith("/api/reports")) return "Report Route";
    return "Basic";
  }

  function walk(stack, prefix = "") {
    stack.forEach((layer) => {
      if (layer.route) {
        const methods = Object.keys(layer.route.methods)
          .map((m) => m.toUpperCase())
          .join(", ");

        const fullPath = prefix + layer.route.path;

        routes.push({
          path: fullPath,
          methods,
          type: classifyRoute(fullPath),
        });
      }

      const sub = layer.handle?.stack || layer.handler?.stack;
      if (sub) walk(sub, prefix);
    });
  }

  walk(root);
  return routes;
};

module.exports = function listRoutes(app) {
  const routes = [];

  // Express router stack lives in one of these locations depending on Express version
  const root =
    (app && app.router && app.router.stack) || (app && app._router && app._router.stack);

  if (!root) return routes;

  function classifyRoute(path) {
    if (!path || typeof path !== "string") return "Basic";
    if (path.includes("/auth")) return "Auth Route";
    if (path.includes("/admin")) return "Admin Route";
    if (path.includes("/users")) return "User Route";
    if (path.includes("/reports")) return "Report Route";
    if (path.includes("/volunteer")) return "Volunteer Route";
    return "Basic";
  }

  // Try to recover mount path from a layer's regexp (router mounts)
  function getLayerPrefix(layer) {
    try {
      if (!layer || !layer.regexp) return "";

      // layer.regexp.source looks like '^\\/api\\/?(?=\\/|$)'
      let src = layer.regexp.source;

      // strip anchors and optional group endings
      src = src.replace('^', '').replace('\\/?(?=\\/|$)', '');
      src = src.replace('(?:', '').replace(')?', '');
      src = src.replace('\\/', '/');

      // remove trailing tokens like '$' if present
      src = src.replace('\\/?$', '');
      src = src.replace('$', '');

      // ensure it starts with '/'
      if (!src.startsWith('/')) src = '/' + src;

      // remove duplicate slashes
      src = src.replace(/\/+/g, '/');

      return src;
    } catch (e) {
      return '';
    }
  }

  function walk(stack, prefix = '') {
    stack.forEach((layer) => {
      // Standard route (layer.route)
      if (layer.route) {
        const methods = Object.keys(layer.route.methods || {})
          .map((m) => m.toUpperCase())
          .join(', ');

        const routePath = Array.isArray(layer.route.path)
          ? layer.route.path.join(',')
          : layer.route.path;

        const fullPath = (prefix || '') + (routePath || '');

        routes.push({ path: fullPath, methods, type: classifyRoute(fullPath) });
      }

      // Router - dive into its stack and compute new prefix
      if (layer.name === 'router' && layer.handle && layer.handle.stack) {
        const mount = getLayerPrefix(layer);
        const nextPrefix = prefix + mount;
        walk(layer.handle.stack, nextPrefix);
      }

      // some layers expose nested stack on handle.stack directly
      const subStack = layer.handle && layer.handle.stack ? layer.handle.stack : null;
      if (!layer.route && subStack && layer.name !== 'router') {
        walk(subStack, prefix);
      }
    });
  }

  walk(root);
  return routes;
};

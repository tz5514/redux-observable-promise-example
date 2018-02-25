const production = process.env.NODE_ENV == 'production';
const next = require('next');
const compression = require('compression');
const routes = require('./generic/modules/router');
const nextApp = next({ dev: !production });
const handler = routes.getRequestHandler(nextApp, ({ req, res, route, query }) => {
  res.redirectRoute = (name, params) => {
    try {
      res.redirect(routes.Router.getUrl(name, params))
    } catch (error) {}
  };
  nextApp.render(req, res, route.page, query)
});

const express = require('express');

nextApp.prepare().then(() => {
  const app = express();
  if (production) {
    app.use(compression());
  }
  app.use(handler);
  app.listen(process.env.PORT || 3000);
});
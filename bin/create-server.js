#!/usr/bin/env node
const debug = require('debug')('main');
const app = require('../index');

module.exports = () => {
  app.set('port', process.env.PORT || 3000);
  const server = app.listen(app.get('port'), () => {
    debug(`Express server listening on port ${server.address().port}`);
  });
  return server;
};

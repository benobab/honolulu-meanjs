(function (app) {
  'use strict';

  app.registerModule('customers', ['core']);// The core module is required for special route handling; see /core/client/config/core.client.routes
  app.registerModule('customers.admin', ['core.admin']);
  app.registerModule('customers.admin.routes', ['core.admin.routes']);
  app.registerModule('customers.services');
  app.registerModule('customers.routes', ['ui.router', 'core.routes', 'customers.services']);
}(ApplicationConfiguration));

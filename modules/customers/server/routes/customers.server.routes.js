'use strict';

/**
 * Module dependencies
 */
var customersPolicy = require('../policies/customers.server.policy'),
  customers = require('../controllers/customers.server.controller');

module.exports = function (app) {
  // Customers collection routes
  app.route('/api/customers').all(customersPolicy.isAllowed)
    .get(customers.mine)
    .post(customers.create);

  // Single customer routes
  app.route('/api/customers/:customerId').all(customersPolicy.isAllowed)
    .get(customers.read)
    .put(customers.update)
    .delete(customers.delete);

  // Finish by binding the customer middleware
  app.param('customerId', customers.customerByID);
};

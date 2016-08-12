'use strict';

var should = require('should'),
  request = require('supertest'),
  path = require('path'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Customer = mongoose.model('Customer'),
  express = require(path.resolve('./config/lib/express'));

/**
 * Globals
 */
var app,
  agent,
  credentials,
  user,
  customer;

/**
 * Customer routes tests
 */
describe('Customer Admin CRUD tests', function () {
  before(function (done) {
    // Get application
    app = express.init(mongoose);
    agent = request.agent(app);

    done();
  });

  beforeEach(function (done) {
    // Create user credentials
    credentials = {
      username: 'username',
      password: 'M3@n.jsI$Aw3$0m3'
    };

    // Create a new user
    user = new User({
      firstName: 'Full',
      lastName: 'Name',
      displayName: 'Full Name',
      email: 'test@test.com',
      roles: ['user', 'admin'],
      username: credentials.username,
      password: credentials.password,
      provider: 'local'
    });

    // Save a user to the test db and create new customer
    user.save(function () {
      customer = {
        title: 'Customer Title',
        content: 'Customer Content'
      };

      done();
    });
  });

  it('should be able to save an customer if logged in', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new customer
        agent.post('/api/customers')
          .send(customer)
          .expect(200)
          .end(function (customerSaveErr, customerSaveRes) {
            // Handle customer save error
            if (customerSaveErr) {
              return done(customerSaveErr);
            }

            // Get a list of customers
            agent.get('/api/customers')
              .end(function (customersGetErr, customersGetRes) {
                // Handle customer save error
                if (customersGetErr) {
                  return done(customersGetErr);
                }

                // Get customers list
                var customers = customersGetRes.body;

                // Set assertions
                (customers[0].user._id).should.equal(userId);
                (customers[0].title).should.match('Customer Title');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should be able to update an customer if signed in', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new customer
        agent.post('/api/customers')
          .send(customer)
          .expect(200)
          .end(function (customerSaveErr, customerSaveRes) {
            // Handle customer save error
            if (customerSaveErr) {
              return done(customerSaveErr);
            }

            // Update customer title
            customer.title = 'WHY YOU GOTTA BE SO MEAN?';

            // Update an existing customer
            agent.put('/api/customers/' + customerSaveRes.body._id)
              .send(customer)
              .expect(200)
              .end(function (customerUpdateErr, customerUpdateRes) {
                // Handle customer update error
                if (customerUpdateErr) {
                  return done(customerUpdateErr);
                }

                // Set assertions
                (customerUpdateRes.body._id).should.equal(customerSaveRes.body._id);
                (customerUpdateRes.body.title).should.match('WHY YOU GOTTA BE SO MEAN?');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to save an customer if no title is provided', function (done) {
    // Invalidate title field
    customer.title = '';

    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new customer
        agent.post('/api/customers')
          .send(customer)
          .expect(400)
          .end(function (customerSaveErr, customerSaveRes) {
            // Set message assertion
            (customerSaveRes.body.message).should.match('Title cannot be blank');

            // Handle customer save error
            done(customerSaveErr);
          });
      });
  });

  it('should be able to delete an customer if signed in', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new customer
        agent.post('/api/customers')
          .send(customer)
          .expect(200)
          .end(function (customerSaveErr, customerSaveRes) {
            // Handle customer save error
            if (customerSaveErr) {
              return done(customerSaveErr);
            }

            // Delete an existing customer
            agent.delete('/api/customers/' + customerSaveRes.body._id)
              .send(customer)
              .expect(200)
              .end(function (customerDeleteErr, customerDeleteRes) {
                // Handle customer error error
                if (customerDeleteErr) {
                  return done(customerDeleteErr);
                }

                // Set assertions
                (customerDeleteRes.body._id).should.equal(customerSaveRes.body._id);

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should be able to get a single customer if signed in and verify the custom "isCurrentUserOwner" field is set to "true"', function (done) {
    // Create new customer model instance
    customer.user = user;
    var customerObj = new Customer(customer);

    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new customer
        agent.post('/api/customers')
          .send(customer)
          .expect(200)
          .end(function (customerSaveErr, customerSaveRes) {
            // Handle customer save error
            if (customerSaveErr) {
              return done(customerSaveErr);
            }

            // Get the customer
            agent.get('/api/customers/' + customerSaveRes.body._id)
              .expect(200)
              .end(function (customerInfoErr, customerInfoRes) {
                // Handle customer error
                if (customerInfoErr) {
                  return done(customerInfoErr);
                }

                // Set assertions
                (customerInfoRes.body._id).should.equal(customerSaveRes.body._id);
                (customerInfoRes.body.title).should.equal(customer.title);

                // Assert that the "isCurrentUserOwner" field is set to true since the current User created it
                (customerInfoRes.body.isCurrentUserOwner).should.equal(true);

                // Call the assertion callback
                done();
              });
          });
      });
  });

  afterEach(function (done) {
    User.remove().exec(function () {
      Customer.remove().exec(done);
    });
  });
});

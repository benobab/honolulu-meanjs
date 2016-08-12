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
describe('Customer CRUD tests', function () {

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

  it('should not be able to save an customer if logged in without the "admin" role', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        agent.post('/api/customers')
          .send(customer)
          .expect(403)
          .end(function (customerSaveErr, customerSaveRes) {
            // Call the assertion callback
            done(customerSaveErr);
          });

      });
  });

  it('should not be able to save an customer if not logged in', function (done) {
    agent.post('/api/customers')
      .send(customer)
      .expect(403)
      .end(function (customerSaveErr, customerSaveRes) {
        // Call the assertion callback
        done(customerSaveErr);
      });
  });

  it('should not be able to update an customer if signed in without the "admin" role', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        agent.post('/api/customers')
          .send(customer)
          .expect(403)
          .end(function (customerSaveErr, customerSaveRes) {
            // Call the assertion callback
            done(customerSaveErr);
          });
      });
  });

  it('should be able to get a list of customers if not signed in', function (done) {
    // Create new customer model instance
    var customerObj = new Customer(customer);

    // Save the customer
    customerObj.save(function () {
      // Request customers
      request(app).get('/api/customers')
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Array).and.have.lengthOf(1);

          // Call the assertion callback
          done();
        });

    });
  });

  it('should be able to get a single customer if not signed in', function (done) {
    // Create new customer model instance
    var customerObj = new Customer(customer);

    // Save the customer
    customerObj.save(function () {
      request(app).get('/api/customers/' + customerObj._id)
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Object).and.have.property('title', customer.title);

          // Call the assertion callback
          done();
        });
    });
  });

  it('should return proper error for single customer with an invalid Id, if not signed in', function (done) {
    // test is not a valid mongoose Id
    request(app).get('/api/customers/test')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'Customer is invalid');

        // Call the assertion callback
        done();
      });
  });

  it('should return proper error for single customer which doesnt exist, if not signed in', function (done) {
    // This is a valid mongoose Id but a non-existent customer
    request(app).get('/api/customers/559e9cd815f80b4c256a8f41')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'No customer with that identifier has been found');

        // Call the assertion callback
        done();
      });
  });

  it('should not be able to delete an customer if signed in without the "admin" role', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        agent.post('/api/customers')
          .send(customer)
          .expect(403)
          .end(function (customerSaveErr, customerSaveRes) {
            // Call the assertion callback
            done(customerSaveErr);
          });
      });
  });

  it('should not be able to delete an customer if not signed in', function (done) {
    // Set customer user
    customer.user = user;

    // Create new customer model instance
    var customerObj = new Customer(customer);

    // Save the customer
    customerObj.save(function () {
      // Try deleting customer
      request(app).delete('/api/customers/' + customerObj._id)
        .expect(403)
        .end(function (customerDeleteErr, customerDeleteRes) {
          // Set message assertion
          (customerDeleteRes.body.message).should.match('User is not authorized');

          // Handle customer error error
          done(customerDeleteErr);
        });

    });
  });

  it('should be able to get a single customer that has an orphaned user reference', function (done) {
    // Create orphan user creds
    var _creds = {
      username: 'orphan',
      password: 'M3@n.jsI$Aw3$0m3'
    };

    // Create orphan user
    var _orphan = new User({
      firstName: 'Full',
      lastName: 'Name',
      displayName: 'Full Name',
      email: 'orphan@test.com',
      username: _creds.username,
      password: _creds.password,
      provider: 'local',
      roles: ['admin']
    });

    _orphan.save(function (err, orphan) {
      // Handle save error
      if (err) {
        return done(err);
      }

      agent.post('/api/auth/signin')
        .send(_creds)
        .expect(200)
        .end(function (signinErr, signinRes) {
          // Handle signin error
          if (signinErr) {
            return done(signinErr);
          }

          // Get the userId
          var orphanId = orphan._id;

          // Save a new customer
          agent.post('/api/customers')
            .send(customer)
            .expect(200)
            .end(function (customerSaveErr, customerSaveRes) {
              // Handle customer save error
              if (customerSaveErr) {
                return done(customerSaveErr);
              }

              // Set assertions on new customer
              (customerSaveRes.body.title).should.equal(customer.title);
              should.exist(customerSaveRes.body.user);
              should.equal(customerSaveRes.body.user._id, orphanId);

              // force the customer to have an orphaned user reference
              orphan.remove(function () {
                // now signin with valid user
                agent.post('/api/auth/signin')
                  .send(credentials)
                  .expect(200)
                  .end(function (err, res) {
                    // Handle signin error
                    if (err) {
                      return done(err);
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
                        should.equal(customerInfoRes.body.user, undefined);

                        // Call the assertion callback
                        done();
                      });
                  });
              });
            });
        });
    });
  });

  it('should be able to get a single customer if not signed in and verify the custom "isCurrentUserOwner" field is set to "false"', function (done) {
    // Create new customer model instance
    var customerObj = new Customer(customer);

    // Save the customer
    customerObj.save(function () {
      request(app).get('/api/customers/' + customerObj._id)
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Object).and.have.property('title', customer.title);
          // Assert the custom field "isCurrentUserOwner" is set to false for the un-authenticated User
          res.body.should.be.instanceof(Object).and.have.property('isCurrentUserOwner', false);
          // Call the assertion callback
          done();
        });
    });
  });

  it('should be able to get single customer, that a different user created, if logged in & verify the "isCurrentUserOwner" field is set to "false"', function (done) {
    // Create temporary user creds
    var _creds = {
      username: 'customerowner',
      password: 'M3@n.jsI$Aw3$0m3'
    };

    // Create user that will create the Customer
    var _customerOwner = new User({
      firstName: 'Full',
      lastName: 'Name',
      displayName: 'Full Name',
      email: 'temp@test.com',
      username: _creds.username,
      password: _creds.password,
      provider: 'local',
      roles: ['admin', 'user']
    });

    _customerOwner.save(function (err, _user) {
      // Handle save error
      if (err) {
        return done(err);
      }

      // Sign in with the user that will create the Customer
      agent.post('/api/auth/signin')
        .send(_creds)
        .expect(200)
        .end(function (signinErr, signinRes) {
          // Handle signin error
          if (signinErr) {
            return done(signinErr);
          }

          // Get the userId
          var userId = _user._id;

          // Save a new customer
          agent.post('/api/customers')
            .send(customer)
            .expect(200)
            .end(function (customerSaveErr, customerSaveRes) {
              // Handle customer save error
              if (customerSaveErr) {
                return done(customerSaveErr);
              }

              // Set assertions on new customer
              (customerSaveRes.body.title).should.equal(customer.title);
              should.exist(customerSaveRes.body.user);
              should.equal(customerSaveRes.body.user._id, userId);

              // now signin with the test suite user
              agent.post('/api/auth/signin')
                .send(credentials)
                .expect(200)
                .end(function (err, res) {
                  // Handle signin error
                  if (err) {
                    return done(err);
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
                      // Assert that the custom field "isCurrentUserOwner" is set to false since the current User didn't create it
                      (customerInfoRes.body.isCurrentUserOwner).should.equal(false);

                      // Call the assertion callback
                      done();
                    });
                });
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

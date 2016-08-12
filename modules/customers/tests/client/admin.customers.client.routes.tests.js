(function () {
  'use strict';

  describe('Customers Route Tests', function () {
    // Initialize global variables
    var $scope,
      CustomersService;

    // We can start by loading the main application module
    beforeEach(module(ApplicationConfiguration.applicationModuleName));

    // The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
    // This allows us to inject a service but then attach it to a variable
    // with the same name as the service.
    beforeEach(inject(function ($rootScope, _CustomersService_) {
      // Set a new global scope
      $scope = $rootScope.$new();
      CustomersService = _CustomersService_;
    }));

    describe('Route Config', function () {
      describe('Main Route', function () {
        var mainstate;
        beforeEach(inject(function ($state) {
          mainstate = $state.get('admin.customers');
        }));

        it('Should have the correct URL', function () {
          expect(mainstate.url).toEqual('/customers');
        });

        it('Should be abstract', function () {
          expect(mainstate.abstract).toBe(true);
        });

        it('Should have template', function () {
          expect(mainstate.template).toBe('<ui-view/>');
        });
      });

      describe('List Route', function () {
        var liststate;
        beforeEach(inject(function ($state) {
          liststate = $state.get('admin.customers.list');
        }));

        it('Should have the correct URL', function () {
          expect(liststate.url).toEqual('');
        });

        it('Should be not abstract', function () {
          expect(liststate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(liststate.templateUrl).toBe('modules/customers/client/views/admin/list-customers.client.view.html');
        });
      });

      describe('Create Route', function () {
        var createstate,
          CustomersController,
          mockCustomer;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          createstate = $state.get('admin.customers.create');
          $templateCache.put('modules/customers/client/views/admin/form-customer.client.view.html', '');

          // Create mock customer
          mockCustomer = new CustomersService();

          // Initialize Controller
          CustomersController = $controller('CustomersController as vm', {
            $scope: $scope,
            customerResolve: mockCustomer
          });
        }));

        it('Should have the correct URL', function () {
          expect(createstate.url).toEqual('/create');
        });

        it('Should have a resolve function', function () {
          expect(typeof createstate.resolve).toEqual('object');
          expect(typeof createstate.resolve.customerResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(createstate)).toEqual('/admin/customers/create');
        }));

        it('should attach an customer to the controller scope', function () {
          expect($scope.vm.customer._id).toBe(mockCustomer._id);
          expect($scope.vm.customer._id).toBe(undefined);
        });

        it('Should not be abstract', function () {
          expect(createstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(createstate.templateUrl).toBe('modules/customers/client/views/admin/form-customer.client.view.html');
        });
      });

      describe('Edit Route', function () {
        var editstate,
          CustomersController,
          mockCustomer;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          editstate = $state.get('admin.customers.edit');
          $templateCache.put('modules/customers/client/views/admin/form-customer.client.view.html', '');

          // Create mock customer
          mockCustomer = new CustomersService({
            _id: '525a8422f6d0f87f0e407a33',
            title: 'An Customer about MEAN',
            content: 'MEAN rocks!'
          });

          // Initialize Controller
          CustomersController = $controller('CustomersController as vm', {
            $scope: $scope,
            customerResolve: mockCustomer
          });
        }));

        it('Should have the correct URL', function () {
          expect(editstate.url).toEqual('/:customerId/edit');
        });

        it('Should have a resolve function', function () {
          expect(typeof editstate.resolve).toEqual('object');
          expect(typeof editstate.resolve.customerResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(editstate, {
            customerId: 1
          })).toEqual('/admin/customers/1/edit');
        }));

        it('should attach an customer to the controller scope', function () {
          expect($scope.vm.customer._id).toBe(mockCustomer._id);
        });

        it('Should not be abstract', function () {
          expect(editstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(editstate.templateUrl).toBe('modules/customers/client/views/admin/form-customer.client.view.html');
        });

        xit('Should go to unauthorized route', function () {

        });
      });

    });
  });
}());

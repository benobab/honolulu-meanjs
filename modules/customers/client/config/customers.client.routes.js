(function () {
  'use strict';

  angular
    .module('customers.routes')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('customers', {
        abstract: true,
        url: '/customers',
        template: '<ui-view/>'
      })
      .state('customers.mine', {
        url: '',
        templateUrl: 'modules/customers/client/views/list-customers.client.view.html',
        controller: 'CustomersListController',
        controllerAs: 'vm',
        data: {
          pageTitle: 'My Customers'
        }
      })
      .state('customers.create', {
        url: '/create',
        templateUrl: 'modules/customers/client/views/form-create-customer.client.view.html',
        data: {
          roles: ['user']
        },
        resolve: {
          customerResolve: newCustomer
        }
      })
      .state('customers.view', {
        url: '/:customerId',
        templateUrl: 'modules/customers/client/views/view-customer.client.view.html',
        controller: 'CustomersController',
        controllerAs: 'vm',
        resolve: {
          customerResolve: getCustomer
        },
        data: {
          pageTitle: 'Customer {{ customerResolve.firstname }}'
        }
      });
  }

  getCustomer.$inject = ['$stateParams', 'CustomersService'];

  function getCustomer($stateParams, CustomersService) {
    return CustomersService.get({
      customerId: $stateParams.customerId
    }).$promise;
  }

  newCustomer.$inject = ['CustomersService'];

  function newCustomer(CustomersService) {
    return new CustomersService();
  }

}());

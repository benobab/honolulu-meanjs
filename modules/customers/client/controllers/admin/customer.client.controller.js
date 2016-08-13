(function () {
  'use strict';

  angular
    .module('customers.admin')
    .controller('CustomersController', CustomersController);

  CustomersController.$inject = ['$scope', '$state', '$window', 'customerResolve', 'Authentication'];

  function CustomersController($scope, $state, $window, customer, Authentication) {
    var vm = this;

    vm.customer = customer;
    vm.authentication = Authentication;
    vm.error = null;
    vm.form = {};
    vm.remove = remove;
    vm.save = save;

    // Remove existing Customer
    function remove() {
      if ($window.confirm('Are you sure you want to delete?')) {
        vm.customer.$remove($state.go('admin.customers.list'));
      }
    }

    // Save Customer
    function save(isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.customerForm');
        return false;
      }

      // Create a new customer, or update the current instance
      vm.customer.createOrUpdate()
        .then(successCallback)
        .catch(errorCallback);

      function successCallback(res) {
        $state.go('customers.mine'); // should we send the User to the list or the updated Customer's view?
      }

      function errorCallback(res) {
        vm.error = res.data.message;
      }
    }
  }
}());

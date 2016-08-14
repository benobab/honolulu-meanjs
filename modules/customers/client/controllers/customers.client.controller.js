(function () {
  'use strict';

  angular
    .module('customers')
    .controller('CustomersController', CustomersController)
    .controller('CustomerUpdateController', CustomerUpdateController);

  CustomersController.$inject = ['$scope', '$state', '$window', 'customerResolve', 'Authentication', '$uibModal', '$log'];// modal and log for modal UI

  function CustomersController($scope, $state, $window, customer, Authentication, $uibModal, $log) {
    var vm = this;

    vm.customer = customer;
    vm.authentication = Authentication;
    vm.error = null;

    vm.remove = remove;
    // Modal UI to update customer!
    vm.animationsEnabled = true;

    vm.sayHi = function() {
      console.log('Hi!');
    };

    // modalUpdate is the function called from the front
    vm.modalUpdate = function (size, selectedCustomer) {
      var modalInstance = $uibModal.open({
        animation: vm.animationsEnabled,
        templateUrl: 'modules/customers/client/views/form-update-customer.client.view.html',
        controller: function ($scope, $uibModalInstance, customer) {
          $scope.customer = customer;
          $scope.cancel = function() {
            $uibModalInstance.dismiss('cancel');
          };
          $scope.ok = function () {
            $uibModalInstance.close($scope.customer);
          };

          $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
          };
        },
        size: size,
        resolve: {
          customer: function () {
            return selectedCustomer;
          }
        }
      });

      modalInstance.result.then(function (selectedItem) {
        $scope.selected = selectedItem;
      }, function () {
        $log.info('Modal dismissed at: ' + new Date());
      });
    };

    vm.toggleAnimation = function () {
      vm.animationsEnabled = !vm.animationsEnabled;
    };

    // Remove existing Customer
    function remove(customer) {
      if ($window.confirm('Are you sure you want to delete this customer?')) {
        // TODO
        customer.$remove($state.go('customers.mine'));
      }
    }
  }

  CustomerUpdateController.$inject = ['$scope', 'CustomersService'];

  function CustomerUpdateController($scope, CustomersService) {

    // Update existing Customer
    this.update = function(updatedCustomer) {
      var customer = updatedCustomer;
      // Create a new customer, or update the current instance
      customer.createOrUpdate()
        .then(successCallback)
        .catch(errorCallback);

      function successCallback(res) {
        // $state.go('customers.mine'); // should we send the User to the list or the updated Customer's view?
        // $state.go('customers.view');
      }

      function errorCallback(res) {
        this.error = res.data.message;
      }
    };
  }
}());

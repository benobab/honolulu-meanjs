(function () {
  'use strict';

  angular
    .module('customers')
    .controller('CustomersController', CustomersController);

  CustomersController.$inject = ['$scope', 'customerResolve', 'Authentication', '$uibModal', '$log'];// modal and log for modal UI

  function CustomersController($scope, customer, Authentication, $uibModal, $log) {
    var vm = this;

    vm.customer = customer;
    vm.authentication = Authentication;
    vm.error = null;


    // Modal UI to update customer!
    vm.animationsEnabled = true;
    // modalUpdate is the function called from the front
    vm.modalUpdate = function (size) {

      var modalInstance = $uibModal.open({
        animation: vm.animationsEnabled,
        templateUrl: 'myModalContent.html',
        controller: 'ModalInstanceCtrl',
        size: size,
        resolve: {
          items: function () {
            return vm.items;
          }
        }
      });

      modalInstance.result.then(function (selectedItem) {
        vm.selected = selectedItem;
      }, function () {
        $log.info('Modal dismissed at: ' + new Date());
      });
    };

    vm.toggleAnimation = function () {
      vm.animationsEnabled = !vm.animationsEnabled;
    };
  }
}());

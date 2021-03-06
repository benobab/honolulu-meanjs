(function () {
  'use strict';

  angular
    .module('customers')
    .run(menuConfig);

  menuConfig.$inject = ['menuService'];

  function menuConfig(menuService) {
    menuService.addMenuItem('topbar', {
      title: 'Customers',
      state: 'customers',
      type: 'dropdown',
      roles: ['user']
    });

    // Add the dropdown list item
    menuService.addSubMenuItem('topbar', 'customers', {
      title: 'My Customers',
      state: 'customers.mine',
      roles: ['*']
    });
    menuService.addSubMenuItem('topbar', 'customers', {
      title: 'Create new Customer',
      state: 'customers.create',
      roles: ['*']
    });
  }
}());

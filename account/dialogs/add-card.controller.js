(function ()
{
  'use strict';

  angular
    .module('app.account')
    .controller('AddCardController', AddCardController);

  /** @ngInject */
  function AddCardController($mdDialog, $scope,body,$http,notifications,$charge,$helpers)
  {
    var vm = this;

    vm.hiddenCC = true;
    vm.hiddenBCC = true;

    $scope.isSubmitClicked = false;

    $scope.body = body;
    $("#cardBody").append($scope.body);

  }
})();

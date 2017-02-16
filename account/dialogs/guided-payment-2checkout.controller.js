(function ()
{
  'use strict';

  angular
    .module('app.account')
    .controller('GuidedPayment2CheckoutController', GuidedPayment2CheckoutController);

  /** @ngInject */
  function GuidedPayment2CheckoutController($mdDialog, $scope,$http,notifications,securityToken)
  {
    var vm = this;
    $scope.twoCheckOut = {
      sid :"",
      skey:""
    };

    $scope.submit2CheckoutRegistration = function () {
      if($scope.twoCheckoutForm.$valid){
        $http({
          method: 'POST',
          url: "/services/duosoftware.paymentgateway.service/2checkout/insertAccKeys",
          headers: {
            'Content-Type': 'application/json',
            'securityToken':securityToken
          },
          data : $scope.twoCheckOut

        }).then(function (response) {

          if(response.data.status){
            notifications.toast("Successfully registered with 2checkout", "success");

            $mdDialog.hide();

          }else{
            notifications.toast("2Checkout registration failed ", "error");
          }

        }, function (response) {
          console.log(response);
          notifications.toast("2Checkout registration failed", "error");
        });
      }
    }

    $scope.closeDialog = function () {
      $mdDialog.hide();
    }
  }
})();

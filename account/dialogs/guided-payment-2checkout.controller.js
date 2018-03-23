(function ()
{
  'use strict';

  angular
    .module('app.myaccount')
    .controller('GuidedPayment2CheckoutController', GuidedPayment2CheckoutController);

  /** @ngInject */
  function GuidedPayment2CheckoutController($mdDialog, $scope,$http,notifications,idToken,$charge)
  {
    var vm = this;
    $scope.twoCheckOut = {
      sid :"",
      skey:""
    };

    $scope.submit2CheckoutRegistration = function () {
      debugger;
      if($scope.twoCheckoutForm.$valid){

        $charge.paymentgateway().insertAccKeys($scope.twoCheckOut).success(function (response) {

          if(response.status){
            notifications.toast("Successfully registered with 2checkout", "success");

            $mdDialog.hide();

          }else{
            notifications.toast("2Checkout registration failed ", "error");
          }

        }).error(function (response) {

          //console.log(response);
          notifications.toast("2Checkout registration failed", "error");
        });
      }
    }

    $scope.closeDialog = function () {
      $mdDialog.hide();
    }
  }
})();

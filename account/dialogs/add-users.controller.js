(function ()
{
  'use strict';

  angular
    .module('app.account')
    .controller('AddUsersController', AddUsersController);

  /** @ngInject */
  function AddUsersController($mdDialog, $scope, numberOfUser,userPrice,$http,notifications,$charge,$helpers)
  {
    var vm = this;

    vm.hiddenCC = true;
    vm.hiddenBCC = true;

    $scope.isSubmitClicked = false;
    $scope.userPrice = userPrice;


    $scope.confirmToProceed = false;

    // Methods
    vm.closeDialog = closeDialog;

    $scope.numberOfUsers = numberOfUser;

    $scope.$watch(function () {
      $scope.price = $scope.numberOfUsers * $scope.userPrice;
    })


    $scope.addUser = function () {

      if($scope.numberOfUsers === undefined || $scope.numberOfUsers < 1){

        notifications.toast("Error, unable to proceed without proper user count", "error");
        return;

      }else if(!$scope.confirmToProceed){
       $scope.confirmToProceed = true;
        return;
      }

      if($scope.confirmToProceed)
      {
        $scope.confirmToProceed = false;
      }

      //.textContent('You are about to add ' + $scope.numberOfUsers + ' additional users for cost of $' + $scope.price + ', Do you want to proceed with the update ?')


          $scope.isSubmitClicked = true;

          $scope.useRatingEngine(true);


    }


    $scope.useRatingEngine = function(isUpdate) {

      var objCheckProcess = {
        "appId": "user",
        "amount": $scope.price
      };

      $charge.ratingengine().checkProcess(objCheckProcess).success(function (data2) {
         var userAmount = parseInt(data2.amount);

        if(isUpdate) {
          userAmount = parseInt(data2.amount) + $scope.numberOfUsers;
        }else{
          userAmount = parseInt(data2.amount) - $scope.numberOfUsers;
        }

          var data = {
            "appId": "user",
            "amount": userAmount,
            "expiry": "",
            "sign": "<="
          }
          var meta = {
            "domainUrl": 'azure.cloudcharge.com',
            "securityToken": $helpers.getCookie('securityToken')
          }
          data = JSON.stringify(data);
          meta = JSON.stringify(meta);
          $http.get('app/main/account/data/ratingengineservice.php/?method=updaterule&&data=' + data + '&&meta=' + meta).then(function (response) {
            if (response.data.success) {
              console.log("Rule updated! ");

                if(isUpdate) {   // pay only when update true
                      $scope.proceedWithPayment();
                  }else{
                      $scope.isSubmitClicked = false;
                     // notifications.toast("Error, unable to proceed with the operation", "error");
                }
            }else{

              console.log("update rule failed! " + response.data);
              $scope.isSubmitClicked = false;

            }
          }, function (response) {
            //debugger;
            //$scope.serviceError = "Unexpected Error Occurred. Please try again later"
            console.log("update rule failed! " + response.data);
            $scope.isSubmitClicked = false;
            //$scope.addedUsers += $scope.numberOfUsers;
           // notifications.toast("Error, unable to proceed with the operation", "error");

            //vm.closeDialog();

          });



      }).error(function (data) {
          console.log(data);
          $scope.isSubmitClicked = false;
          //$scope.addedUsers += $scope.numberOfUsers;
          notifications.toast("Error, unable to proceed with the operation", "error");
          //vm.closeDialog();
        });
    }

    function closeDialog()
    {
      $scope.numberOfUsers = 0;
      $mdDialog.hide();
    }


    $scope.proceedWithPayment = function()
    {

      $http({
        method : 'GET',
        url : "/azureshell/app/main/account/paymentMethod/alarcartHandler.php?view=addAdditionalUsers&userCount="+$scope.numberOfUsers+"&userPrice="+$scope.price,
        headers: {
          'Content-Type': 'application/json'
        }}).then(function(response) {

        if(response.data.status) {
            $scope.isSubmitClicked = false;
            $scope.addedUsers += $scope.numberOfUsers;
            notifications.toast($scope.numberOfUsers + " additional users successfully added ", "success");

            vm.closeDialog();
        }else{
          notifications.toast(response.data.response + ", additional users adding failed ", "error");
          $scope.useRatingEngine(false);
        }

      }, function(response) {
        console.log(response);

        notifications.toast(response.data.response + ", additional users adding failed ", "error");

        $scope.useRatingEngine(false);

      });

    }
  }
})();

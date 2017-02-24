(function ()
{
   'use strict';

  angular
    .module('app.account')
    .controller('AccountController', AccountController);

  /** @ngInject */
  function AccountController($scope, $interval, $mdSidenav, $charge, $filter,$http,$window,$mdDialog,notifications, $timeout) {
    $scope.acc = "";
    //console.log("Profile Controller Called.");
    var vm = this;

    vm.editableMode = false;
    $scope.companyPricePlans = null;
    $scope.selectedPlan = null;
    $scope.tenantId = null;
    $scope.isUserAdmin = false;
    $scope.paymentHistoryList = null;

    $scope.paymentTenant = "0";
    $scope.paymentPlan = "0";
    $scope.paymentSecurityToken = "0";
    $scope.paymentPrice = "0";
    $scope.paymentName = "0";

    $scope.isYearly = false;
    $scope.planDuration = 'Yearly';
    $scope.cardDetails = null;

    $scope.signupsuccess = false;
    $scope.isDefaultPayment = '1';
    $scope.defaultPayment = defaultPayment;
    $scope.admin = true;
    $scope.normal = false;
    $scope.isEditablePassword = false;
    $scope.user = {
      currentPassword : '',
      newPassword : '',
      confirmNewPassword : ''
    };
    $scope.baseCurrency="";
    //$charge.commondata().getDuobaseValuesByTableName("CTS_GeneralAttributes").success(function(data) {
    //  debugger;
    //  $scope.baseCurrency=data[0].RecordFieldData;
    //}).error(function(data) {
    //})
    $scope.setPlanDuration = function (duration) {
      $scope.$watch(function () {
        $scope.planDuration = duration;
      });
    };


    function gst(name) {
      var nameEQ = name + "=";
      var ca = document.cookie.split(';');
      for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
      }
      //debugger;
      return null;
    }

    $scope.idToken= gst('securityToken');

    if(!$scope.idToken)
      $scope.idToken= "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6IklkVG9rZW5TaWduaW5nS2V5Q29udGFpbmVyLnYyIn0.eyJleHAiOjE0ODc5OTI1OTgsIm5iZiI6MTQ4NzkwOTc5OCwidmVyIjoiMS4wIiwiaXNzIjoiaHR0cHM6Ly9sb2dpbi5taWNyb3NvZnRvbmxpbmUuY29tL2MxZjlmOGU2LTM0NjktNGQ1Zi1hMzI2LTgzZTk5MGE5OTI2YS92Mi4wLyIsInN1YiI6IjY5MGNjMmIxLTk4N2UtNDc0YS05ZjM4LWNmNGZmZGIxMjU0OCIsImF1ZCI6ImQwODRhMjI3LWJiNTItNDk5Mi04ODlkLTZlNDgzNTYxMGU3NiIsIm5vbmNlIjoiZGVmYXVsdE5vbmNlIiwiaWF0IjoxNDg3OTA5Nzk4LCJhdXRoX3RpbWUiOjE0ODc5MDk3OTgsIm9pZCI6IjY5MGNjMmIxLTk4N2UtNDc0YS05ZjM4LWNmNGZmZGIxMjU0OCIsImdpdmVuX25hbWUiOiJ6YXJpemF2aW5hIiwibmFtZSI6Inphcml6YXZpbmEiLCJjb3VudHJ5IjoiU3QgSGVsZW5hLCBBc2NlbnNpb24sIFRyaXN0YW4gZGEgQ3VuaGEiLCJleHRlbnNpb25fRG9tYWluIjoiemFyaXphdmluYS5jbG91ZGNoYXJnZS5jb20iLCJmYW1pbHlfbmFtZSI6ImZyZWVfdHJpYWwiLCJqb2JUaXRsZSI6ImFkbWluIiwiZW1haWxzIjpbInphcml6YXZpbmFAMTJzdG9yYWdlLmNvbSJdLCJ0ZnAiOiJCMkNfMV9EZWZhdWx0UG9saWN5In0.mh27mcrcAePt1IiBwyOREmqEG1Ok1DLJUsDODUkm-OzgLKrCg7OjrcrSUul4sZsbniNehbVfNJ4GMXOng9TEN6K7cMLLa7dfLQSjtsGY5YfACVExMoEiGvXMepP0ReiKFZ0bwSxQD7IHNyysnhrT1UysPtUDmmBvnp86mEzh-6ZE4F0iFYSoCZv7fAMtOy-EJwUwt2O0er8cpkwyrvqdzFo2Op0YhuWHaQFiOJegbI784iPxsWbX6MJ2HP7DX47P5q7uGFV5_xXpgpZ_8Bme1HPY65XVTZOBhemfqC3s1U1da4G7Kc0X1gKq5RG1XEIC83rDEhyYD2k1YvRMQDk9Zg";//gst('idToken');

    (function (){
      $http({
        method: 'GET',
        url: 'http://dev.cloudcharge.com:8001/auth/getSubscriptionInfo',
        headers: {
          'Content-Type': 'application/json',
          'id_token' : $scope.idToken
        }
      }).success(function (response) {
        $scope.access_keys = [{
          name: "Primary key",
          key: response.Result.primaryKey
        },{
          name: "Secondary key",
          key: response.Result.secondaryKey
        }];
      }).error(function (errorResponse) {
        console.log(errorResponse);
      });
    })();


    $scope.freeTrialStartDate = '';
    $scope.displayExpireDate = '';
    $scope.paidPlanExpireDate = '';

    $scope.registeredVendors = {
      stripe: true,
      twocheckout : true
    }

    $scope.onlinePaymentRegister = function(ev, vendor) {
      if(!$scope.isRegisteredWithStripe){
        var confirm = $mdDialog.confirm()
          .title(vendor + ' registration')
          .textContent('Would you like to register with ' + vendor + ' for your online payments?')
          .targetEvent(ev)
          .ok('Yes')
          .cancel('No');

        $mdDialog.show(confirm).then(function() {
          $scope.isRegisteredWithStripe = true;
          $scope.proceedWithStripe();
        }, function() {
          $scope.isRegisteredWithStripe = false;
        });
      }else{
        var confirm = $mdDialog.confirm()
          .title(vendor + ' sign out?')
          .textContent('Would you like to sign out from ' + vendor + '?')
          .targetEvent(ev)
          .ok('Yes')
          .cancel('No');

        $mdDialog.show(confirm).then(function() {
          $scope.isRegisteredWithStripe = false;
        }, function() {
          $scope.isRegisteredWithStripe = true;
        });
      }

    };

    //Online payment registration menu
    vm.openRegistrationMenu = function($mdOpenMenu, ev) {
      $mdOpenMenu(ev);
    };

    $timeout(function () {
      var accoState=localStorage.getItem("myProfile");
      if(accoState == 'isSetToolbarUpgrade'){
        $scope.signupsuccess = true;
        localStorage.removeItem('myProfile');
      }
    },0);

    $scope.newCardSelected = false;

    vm.dummy = {"Success":true,"Message":""
      //,"Data": {"Address":"asdasdsada","Company":"DUO","Country":"Sri Lanka","Email":"devadmin@cloudcharge.com","NIC":"123456789v","Name":"dev admin","PhoneNumber":"45454545"}
    };


    $scope.loadCardDetails = function() {

      $http({
        method: 'GET',
        url: "/azureshell/app/main/account/paymentMethod/cardHandler.php?view=getCardDetails",
        headers: {
          'Content-Type': 'application/json'
        }
      }).then(function (response) {

        if(!response.data.status){
          return;
        }

        $scope.cardDetails = response.data.data;


        for (var i = 0; i < $scope.cardDetails.length; i++) {
          $scope.cardDetails[i].rowId = i;
        }

      }, function (response) {
        console.log(response);
        $scope.cardDetails = null;

      });

    }

    $scope.loadCardDetails();



    $scope.isRegisteredWithStripe = false;
    $scope.isRegisteredWith2checkout = false;

    $scope.isRegButtonsShow = true;

    $scope.checkPaymentMethodRegistry = function(){

      //$http({
      //  method: 'GET',
      //  url: 'http://azure.cloudcharge.com/services/duosoftware.paymentgateway.service/commongateway/connectedGateways',
      //  headers: {
      //    'Content-Type': 'application/json',
      //    'idToken' : $scope.idToken
      //  }
      //}).success(function (data) {

      $charge.paymentgateway().stripeCheckAccount().success(function (data) {

        if(data.status) {
          for (var i = 0; i < data.data.length; i++) {
            if (data.data[i].gateway === "stripe")
              $scope.isRegisteredWithStripe = true;

            if (data.data[i].gateway === "2checkout")
              $scope.isRegisteredWith2checkout = true;
          }

          $scope.isRegButtonsShow = false;

        }

      }).error(function(data) {
        console.log( data);

        $scope.isRegisteredWithStripe = false;
        $scope.isRegisteredWith2checkout = false;
        $scope.isRegButtonsShow = false;

      });

    }

    $scope.checkPaymentMethodRegistry();


    $http.get('app/main/account/data/plans.json').
      success(function (data, status, headers, config) {
        $scope.companyPricePlans = data;

      }).
      error(function (data, status, headers, config) {
        $scope.companyPricePlans = null;
        console.log('cant load Plans !');
      });


    var selectPlan = function(planId)
    {
      for(var i = 0 ; i <$scope.companyPricePlans.length;i++){
        if($scope.companyPricePlans[i].id === planId){
          $scope.selectedPlan = $scope.companyPricePlans[i];
        }
      }
    }


    //Make Default

    function defaultPayment(selectedPayment,cardDetails){
      $scope.isDefaultPayment = selectedPayment;

      $http({
        method : 'GET',
        url : "/azureshell/app/main/account/paymentMethod/cardHandler.php?view=setCardDefault&cardId="+cardDetails.id,
        headers: {
          'Content-Type': 'application/json'
        }}).then(function(response) {

        $scope.loadCardDetails();

        notifications.toast("Default card has been changed", "success");

      }, function(response) {
        console.log('set card function returned an error '+response);
        notifications.toast("Error, unable to proceed with the operation", "error");


      });
    }

    $scope.showCurrPlan = function() {
      //$mdDialog.show({
      //  controller: 'AccountDialogController',
      //  templateUrl: 'app/main/account/current-plan-dialog.html',
      //  parent: angular.element(document.body),
      //  targetEvent: ev,
      //  clickOutsideToClose:true,
      //  locals:{
      //    selectedPlanDetails:$scope.selectedPlan
      //  }
      //})
      //  .then(function(answer) {
      //
      //  }, function() {
      //
      //  });

      if($scope.selectedPlan.per == "/ Mo" || $scope.selectedPlan.no == 1 || $scope.selectedPlan.no == 2 ){
        $scope.signupsuccess = true;
        $scope.$watch(function () {
          $scope.planDuration = "Monthly";
        });
        $scope.currentPlan = $scope.selectedPlan.no;
      }else if($scope.selectedPlan.per == "/ Yr"){
        $scope.signupsuccess = true;
        $scope.$watch(function () {
          $scope.planDuration = "Yearly";
        });
        $scope.currentPlan = $scope.selectedPlan.no;
      }
    };



    $http({
      method: 'GET',
      url: 'http://dev.cloudcharge.com:8001/auth/getUserInfoByID',
      headers: {
        'id_token':$scope.idToken
      }
    }).then(function(response) {

      console.log(response);

      vm.dummy.Data =response.data.Result;

      $scope.tenantId = response.data.Result.domain.split('.')[0];

        if(response.data.Result.UserType === "admin"){
          $scope.isUserAdmin = true;
        }

        console.log(response.data.Result.plan);

        selectPlan(response.data.Result.plan);

        $scope.userPrice = ($scope.selectedPlan.no > 4) ? 20 : 2;

        $scope.calculateFreeTrialExpireDate();


    }, function(response) {
      console.log(response);
    });



    $scope.calculateFreeTrialExpireDate = function(){

      if($scope.selectedPlan)
      {

        $scope.remainingDays = 0;
        var today = new Date();

        if($scope.selectedPlan.id === 'free_trial' && $scope.freeTrialStartDate != '')
        {
          var convertedDate = new Date($scope.freeTrialStartDate);


          convertedDate.setDate(convertedDate.getDate() + parseInt($scope.selectedPlan.period));

          $scope.remainingDays = (Math.round((convertedDate- today )/(1000*60*60*24))) +  " Days remaining";

          $scope.displayExpireDate = moment(convertedDate.toISOString()).format('LL');
        }
        else
        {
          $scope.displayExpireDate = $scope.paidPlanExpireDate;

          var convertedDate = new Date($scope.paidPlanExpireDate);

          //$scope.remainingDays = (Math.round((convertedDate- today )/(1000*60*60*24))) + " Days remaining";

        }
      }

    }

    $scope.isTenantPaymentHistoryClicked = false;
    $scope.getTenantPaymentHistory = function() {

      $scope.isTenantPaymentHistoryClicked = true;
      $charge.paymentgateway().getAllPaymentByTenant(0, 100, 'cloudcharge').success(function (data) {

      //$http({
      //  method: 'GET',
      //  url: 'http://azure.cloudcharge.com/services/duosoftware.paymentgateway.service/payinfo/getAllPaymentByTenant/?skip=0&take=100&type=cloudcharge',
      //  headers: {
      //    'Content-Type': 'application/json',
      //    'idToken' : $scope.idToken
      //  },
      //  data:{
      //
      //  }
      //}).success(function (data) {

        $scope.paymentHistoryList = null;
        $scope.paymentHistoryList = data;

        $scope.isTenantPaymentHistoryClicked = false;


      }).error(function (data) {
        console.log(data);
        //$scope.paymentHistoryList = null;
        $scope.isTenantPaymentHistoryClicked = false;

      });

    }

    $scope.getTenantPaymentHistory();


    $scope.deactiveCurrentPlan = function(){  // EOD deactivation


      var confirm = $mdDialog.confirm()
        .title('Deactivate current plan')
        .textContent('Would you like to deactivate current plan?')
        .targetEvent()
        .ok('Yes')
        .cancel('No');

      $mdDialog.show(confirm).then(function() {

        //$http({
        //  method : 'POST',
        //  url : "http://azure.cloudcharge.com/services/duosoftware.paymentgateway.service/stripe/permanentDisconnect",
        //  headers: {
        //    'Content-Type': 'application/json',
        //    'idToken':$scope.idToken
        //  },
        //  data : {'action':'eod'}
        //}).then(function(response) {

        var disconnectData = {'action':'eod'};
        $charge.paymentgateway().permanentDisconnect(disconnectData).success(function (data) {

          console.log(response);
          if(response.data.status)
          {
            $scope.isTempDeactive = false;
            notifications.toast("Operation successful, your subscription period will be ending on "+ $scope.displayExpireDate, "success");

          }else{

            notifications.toast("Subscription disconnection not completed", "error");

          }


        }).error(function (response) {
          console.log(response);

          notifications.toast("Subscription disconnection not completed", "error");

        })

      }, function() {

      });



    }


    $scope.registerWithTwoCheckout = function() {


      var confirm = $mdDialog.confirm()
        .title('2Checkout Register')
        .textContent('Do you want to proceed ?')
        .ariaLabel('Lucky day')
        .ok('Yes')
        .cancel('No');
      $mdDialog.show(confirm).then(function (ev) {

        $mdDialog.show({
          controller: 'GuidedPayment2CheckoutController',
          templateUrl: 'app/main/account/dialogs/guided-payment-2checkout.html',
          parent: angular.element(document.body),
          targetEvent: ev,
          clickOutsideToClose:false,
          locals:{
            idToken : $scope.idToken
          }
        })
        .then(function(answer) {
            $scope.checkPaymentMethodRegistry();

        }, function() {

        });

      }, function () {
        $mdDialog.hide();
      });

    }


    $scope.deleteWithTwoCheckout = function() {


      var confirm = $mdDialog.confirm()
        .title('2Checkout disconnect')
        .textContent('Do you want to proceed ?')
        .ariaLabel('Lucky day')
        .ok('Yes')
        .cancel('No');
      $mdDialog.show(confirm).then(function () {

        $charge.paymentgateway().deleteClient().success(function (response) {

          if(response.status){
              $scope.isRegisteredWith2checkout = false;
              notifications.toast("Successfully disconnected with 2checkout ", "success");
            }else{
              notifications.toast("2Checkout disconnection failed", "error");
            }


          }).error(function (response) {
            console.log(response);
            notifications.toast("2Checkout disconnection failed", "error");

          });


      }, function () {
        $mdDialog.hide();
      });

    }


    $scope.saveProfileDetails = function(isEdit){

      vm.editableMode = isEdit;
      if(isEdit)
        return;

      $http({
        method : 'POST',
        url : "/apis/profile/userprofile",
        headers: {
          'Content-Type': 'application/json',
          'idToken':$scope.idToken
        },
        data : vm.dummy.Data

      }).then(function(response) {
        console.log(response);

        if (response.data.Data.IsSuccess) {

          vm.editableMode = false;
          notifications.toast("User profile updated", "success");

        }else{
          vm.editableMode = true;
          notifications.toast("Error updating details, " + response.data.Message, "error");
        }

      }, function(response) {
        console.log(response);
        vm.editableMode = true;
        notifications.toast("Error updating details, " + response, "error");
      });
    }

    $scope.config = {
      publishKey: 'pk_test_5V8EeTzXU8XTo0KQN0SkPf3V',
      title: 'Cloudcharge',
      description: "for connected business",
      logo: 'app/main/account/img/loginDuo.png',
      label: 'Pay amount'
    }

    $scope.$on('stripe-token-received', function(event, args) {
      console.log(args);

      if($scope.newCardSelected){

        $http({
          method : 'GET',
          url : "/azureshell/app/main/account/paymentMethod/cardHandler.php?view=addCard&token="+args.id+"&default=true",
          headers: {
            'Content-Type': 'application/json'
          }}).then(function(response) {

          $scope.loadCardDetails();

        }, function(response) {
          console.log('add card function returned an error '+response);
        });

      } else {
        $scope.isPlanSelected = true;

        $window.location.href = '/azureshell/app/main/account/paymentMethod/cookieHelper.php?selectedPlan=' + $scope.selectedPlan.id + '&plan=' + $scope.paymentPlan + '&price=' + ( $scope.paymentPrice) + '&name=' + $scope.paymentName + '&tenantID=' + $scope.paymentTenant + '&stripeToken=' + args.id + '&paymentStatus='+$scope.paymentStatus ;
        //$window.location.href = '/azureshell/app/main/account/paymentMethod/cookieHelper.php?plan=' +  $scope.paymentPlan + '&st=' +  $scope.paymentSecurityToken + '&price=' + ( $scope.paymentPrice ) + '&name=' +  $scope.paymentName + '&tenantID=' +  $scope.paymentTenant+ '&stripeToken=' +  args.id;
      }

    });


    $scope.addNewCard = function(){
      $scope.newCardSelected = true;
    }


    $scope.selectPlan = function (packaged)
    {
      if($scope.selectedPlan.price > 0 || $scope.paymentStatus === 'canceled') {

        var confirm = $mdDialog.confirm()
          .title('Update Package')
          .textContent('You are going to change your current plan to ' + packaged.name + ' and it will cost amount of $' + packaged.price + ', Do you want to proceed with the update ?')
          .ariaLabel('Lucky day')
          .ok('Yes')
          .cancel('No');
        $mdDialog.show(confirm).then(function () {

          $scope.getUserTenantData($scope.idToken, packaged);

        }, function () {
          $scope.isPlanSelected = false;
          $mdDialog.hide();
        });

      }else{
        $scope.getUserTenantData($scope.idToken, packaged);
      }

    }

    $scope.getUserTenantData = function (secToken,pack) {

      $scope.isPlanSelected= true;

      submitTenantDetails(pack,'')
    };


    var submitTenantDetails = function (pack,dataa) {

      $scope.paymentTenant = $scope.tenantId ;
      $scope.paymentPlan = pack.id;
      $scope.paymentSecurityToken = $scope.idToken;
      $scope.paymentPrice = (pack.price);
      $scope.paymentName = pack.name;

      if($scope.selectedPlan.price > 0 || $scope.paymentStatus === 'canceled') {

        if($scope.userdata > 0 && $scope.paymentStatus != 'canceled')
        {

          $scope.addUp = 2; // additionalUserPrice

          if(pack.no > 4){
            $scope.addUp = 2*10;   //one user into 12 months
          }


          $http({
            method : 'POST',
            url : '/azureshell/app/main/account/paymentMethod/alarcartHandler.php?view=updatePackageWithAddAdditionalUsers&userCount='+$scope.userdata+'&userPrice='+($scope.userdata * $scope.addUp)+ '&selectedPlan=' +  $scope.selectedPlan.id + '&plan=' +  $scope.paymentPlan + '&price=' + ( $scope.paymentPrice) + '&name=' +  $scope.paymentName + '&tenantID=' +  $scope.paymentTenant+ '&paymentStatus='+$scope.paymentStatus ,
            headers: {
              'Content-Type': 'application/json'
            }
          }).then(function(response) {

            console.log(response);

            if(response.data.status){

              $scope.useRatingEngine($scope.userdata,($scope.userdata * $scope.addUp));

            }else{

              notifications.toast("Error updating plan,"+response.data.response+" Please check again ", "error");
              $scope.clickCancel();

            }


          }, function(response) {
            console.log(response);
            notifications.toast("Error updating plan,"+response.data.response+" Please check again ", "error");

            $scope.clickCancel();
          });

        }else {

          //$window.location.href = '/azureshell/app/main/account/paymentMethod/charge.php';
          $window.location.href = '/azureshell/app/main/account/paymentMethod/cookieHelper.php?selectedPlan=' +  $scope.selectedPlan.id + '&plan=' +  $scope.paymentPlan + '&price=' + ( $scope.paymentPrice) + '&name=' +  $scope.paymentName + '&tenantID=' +  $scope.paymentTenant+ '&paymentStatus='+$scope.paymentStatus ;
        }

      }
    }


    $scope.useRatingEngine = function(numberOfUsers,price) {

      var objCheckProcess = {
        "appId": "user",
        "amount": price
      };

      $charge.ratingengine().checkProcess(objCheckProcess).success(function (data2) {
        var userAmount = parseInt(data2.amount);

        userAmount = parseInt(data2.amount) + parseInt(numberOfUsers);


        var data = {
          "appId": "user",
          "amount": userAmount,
          "expiry": "",
          "sign": "<="
        }
        var meta = {
          "domainUrl": window.location.hostname,
          "idToken": $scope.idToken
        }
        data = JSON.stringify(data);
        meta = JSON.stringify(meta);
        $http.get('app/main/account/data/ratingengineservice.php/?method=updaterule&&data=' + data + '&&meta=' + meta).then(function (response) {
          if (response.data.success) {

            console.log("Rule updated! ");

          }else{

            console.log("update rule failed! " + response.data);

          }

          notifications.toast("Plan successfully updated ", "success");

          $window.location.reload();

        }, function (response) {
          console.log("update rule failed! " + response.data);

        });



      }).error(function (data) {
        console.log(data);
        $scope.isSubmitClicked = false;
        //$scope.addedUsers += $scope.numberOfUsers;
        notifications.toast("Error, unable to proceed with the operation", "error");
        //vm.closeDialog();
      });
    }


    var displaycreateCompanyDetailsSubmissionError = function (message,title) {

      if(message === 'Wrong Current Password.'){
        message = 'Your current password is incorrect, please try again';
      }

      $mdDialog.show(
        $mdDialog.alert()
          .parent(angular.element(document.body))
          .clickOutsideToClose(true)
          .title(''+title+'')
          .textContent('' + message + '')
          .ariaLabel(''+title+'')
          .ok('Got it!')
      );
    };


    $scope.isChangePasswordSelected = false;

    $scope.changePassword = function(){

      if($scope.user.currentPassword === ''){
        notifications.toast("Please enter your current password!", "Error");
        return;
      }
      else if($scope.user.newPassword === ''){
        notifications.toast("Please enter your new password!", "Error");
        return;
      }
      else if($scope.user.newPassword != $scope.user.confirmNewPassword){
        notifications.toast("Entered passwords does not match with each other!", "Error");
        return;
      }

      $scope.isChangePasswordSelected = true;

      $http({
        method: 'GET',
        url: '/apis/authorization/userauthorization/changepassword/'+$scope.user.currentPassword+'/'+$scope.user.newPassword,
        //url: 'http://dev.cloudcharge.com/auth/resetAPIUserPassword',
        headers: {
          'Content-Type': 'application/json',
          'id_token' : $scope.idToken
        }
      })
        .success(function (dataa) {
          var title = "Error";
          if(dataa.Success)
          {
            title = "Success";

            $scope.clearPassword();
          }

          displaycreateCompanyDetailsSubmissionError(dataa.Message , title);
          $scope.isChangePasswordSelected = false;


        })
        .error(function (data) {
          displaycreateCompanyDetailsSubmissionError('Password not been changed duo to '+data ,'Failed to change password');
          $scope.isChangePasswordSelected = false;

        });

    }


    $scope.clearPassword = function(){

      $scope.user = {
        currentPassword : '',
        newPassword : '',
        confirmNewPassword : ''
      };

      $scope.isEditablePassword = !$scope.isEditablePassword;
    }


    $scope.proceedWithStripe = function(){


      var confirm = $mdDialog.confirm()
        .title('Connect with stripe')
        .textContent('Do you want to proceed ?')
        .ariaLabel('Lucky day')
        .ok('Yes')
        .cancel('No');
      $mdDialog.show(confirm).then(function () {

      $scope.isRegButtonsShow = true;
      //$window.location.href = 'https://connect.stripe.com/oauth/authorize?response_type=code&scope=read_write&client_id=ca_9SnbSf9mKGaz5k4lelzQIQJZ3FjgQ79h';
      $window.location.href = '/azureshell/app/main/account/paymentMethod/payment-partial.php';

      }, function () {
        $mdDialog.hide();

      });


    }

    $scope.clickCancel = function(){

      $scope.signupsuccess=false;
      $scope.isPlanSelected = false;

    }

    $scope.disconnectWithStripe = function(){

      $scope.isRegButtonsShow = true;


      var confirm = $mdDialog.confirm()
        .title('Disconnect with stripe')
        .textContent('Do you want to proceed with stripe disconnection?')
        .ariaLabel('Lucky day')
        .ok('Yes')
        .cancel('No');
      $mdDialog.show(confirm).then(function () {



        //$http({
        //  method: 'GET',
        //  url: 'http://azure.cloudcharge.com/services/duosoftware.paymentgateway.service/stripe/deactiveAcc',
        //  headers: {
        //    'Content-Type': 'application/json',
        //    'idToken':$scope.idToken
        //  }
        //}).success(function (dataa) {

        $charge.paymentgateway().deactiveAcc().success(function (dataa) {

          console.log(dataa);

          if(dataa.status)
          {
            notifications.toast("You have successfully disconnected with stripe", "Success");
            $scope.isRegisteredWithStripe = false;
          }else{
            notifications.toast("There is a problem, Please try again", "Error");
          }

          $scope.isRegButtonsShow= false;

        }).error(function (data) {
          console.log(data);
          $scope.isRegButtonsShow= false;
          notifications.toast("There is a problem, Please try again", "Error");

        });

      }, function () {
        $scope.isRegButtonsShow = true;
      });

    }

    $scope.numberOfUsers = 0;
    $scope.userPrice = 2;

    $scope.addMoreUsersDialog = function (ev) {
      $mdDialog.show({
        controller: 'AddUsersController as vm',
        templateUrl: 'app/main/account/dialogs/addUsersDialog.html',
        parent: angular.element(document.body),
        targetEvent: ev,
        clickOutsideToClose:false,
        locals : {
          numberOfUser : $scope.numberOfUsers,
          userPrice:$scope.userPrice

        }
      })
        .then(function(answer) {

          $scope.addMoreUsers();
          $scope.getTenantPaymentHistory();

        }, function() {
        });
    }



    $scope.userdata=0;
    $scope.paymentStatus = "";
    $scope.isTempDeactive = false;

    $scope.addMoreUsers = function () {

      //$http({
      //  method: 'GET',
      //  url: 'http://azure.cloudcharge.com/services/duosoftware.paymentgateway.service/stripe/subscriberCheck',
      //  headers: {
      //    'Content-Type': 'application/json',
      //    'idToken' : $scope.idToken
      //  }
      //}).success(function (data) {

      $charge.paymentgateway().subscriberCheck().success(function (data) {

        console.log(data);


        $scope.paymentStatus = data.response[0].status;
        if( data.response[0].planStatus === 'Active')
        {
          $scope.isTempDeactive = true;
        }

        for (var i = 0; i < data.response[0].otherInfo.length; i++) {
          if(data.response[0].otherInfo[i].tag === 'user')
          {
            $scope.userdata = data.response[0].otherInfo[i].quantity;
          }
        }

        var planEndDate = $filter('date')((data.response[0].currentPeriodEnd * 1000), 'yyyy-MM-dd');
        $scope.paidPlanExpireDate = planEndDate;
          //moment(convertedDate.toISOString()).format('LL');


      }).error(function (data) {

        if(data.response)
          $scope.paymentStatus = data.response;

      });

    }

    $scope.addMoreUsers();

    $scope.xfiedKey = 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX';
    $scope.isKeyShowing = false;
    $scope.keyIndex = 0;
    $scope.currentlyOn = "Primary key";

    $scope.resetKey = function(key){
      $scope.isKeyResetting = true;
    };

    $scope.showAccessKey = function(key, index){
      $scope.keyIndex = index;
      document.getElementsByClassName('access-key')[index].innerHTML=key.key;
      $scope.isKeyShowing = true;
      $scope.currentlyOn = key.name;
    }

    $scope.hideAccessKey = function(key, index){
      $scope.keyIndex = index;
      var length = key.key.length;
      document.getElementsByClassName('access-key')[index].innerHTML=$scope.xfiedKey.substring(0, length);
      $scope.isKeyShowing = false;
      $scope.currentlyOn = key.name;
    };

    $scope.copyToClipboard = function (id) {
      window.getSelection().empty();
      var ID = "#"+id;
      var notif = document.querySelector(ID+' span.copy-msg');
      var copyField = document.querySelector(ID);
      var range = document.createRange();
      range.selectNode(copyField);
      window.getSelection().addRange(range);
      document.execCommand('copy');
      if(notif != null){
        notif.remove();
        copyField.insertAdjacentHTML('beforeend', '<span class="copy-msg">Copied</span>');
      }else{
        copyField.insertAdjacentHTML('beforeend', '<span class="copy-msg">Copied</span>');
      }

    }

  }
})();

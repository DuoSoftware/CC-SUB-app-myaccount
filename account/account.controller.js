
(function ()
{
	'use strict';

	angular
		.module('app.account')
		.controller('AccountController', AccountController);

	/** @ngInject */
	function AccountController($scope, $interval, $mdSidenav, $charge, $filter,$http,$window,$mdDialog,notifications, $timeout,$parse,logHelper) {
		$scope.acc = "";
		//// console.log("Profile Controller Called.");
		var vm = this;
		vm.appInnerState = 'default';
		vm.activeAccountPaneIndex = 0;

		$scope.generalDetails = true;
		$scope.planDetails = false;
		$scope.paymentHistory = false;
		$scope.onlinePayments = false;
		$scope.apiDetails = false;

		$scope.switchInpageState = function (switchTo){
			if(switchTo == 'general-details'){
				$scope.generalDetails = true;
				$scope.planDetails = false;
				$scope.paymentHistory = false;
				$scope.onlinePayments = false;
				$scope.apiDetails = false;
			}else if(switchTo == 'plan-details'){
				$scope.generalDetails = false;
				$scope.planDetails = true;
				$scope.paymentHistory = false;
				$scope.onlinePayments = false;
				$scope.apiDetails = false;

			}else if(switchTo == 'payment-history'){
				$scope.generalDetails = false;
				$scope.planDetails = false;
				$scope.paymentHistory = true;
				$scope.onlinePayments = false;
				$scope.apiDetails = false;
			}else if(switchTo == 'online-payments'){
				$scope.onlinePayments = true;
				$scope.generalDetails = false;
				$scope.planDetails = false;
				$scope.paymentHistory = false;
				$scope.apiDetails = false;
			}else if(switchTo == 'api-details'){
				$scope.onlinePayments = false;
				$scope.generalDetails = false;
				$scope.planDetails = false;
				$scope.paymentHistory = false;
				$scope.apiDetails = true;
			}
		}

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
		$scope.selectedPlanDuration = 'Monthly';
		
		$scope.setPlanDuration = function (duration) {
			$scope.$watch(function () {
				$scope.planDuration = duration;
			});
		};

		$scope.monthEndDate = function(_date){
			var date = new Date(_date);
			var lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
			return lastDay;
		};



		$scope.businessSlider = {
			value: 0,
			options: {
				floor: 0,
				ceil: 5000,
				step: 1000,
				showSelectionBar: true,
				selectionBarGradient: {
					from: 'white',
					to: '#039be5'
				}
			}
		};


		$scope.subscriptionRate = 0;
		$scope.activeSubscriptions = 0;
		var oneDay = 24*60*60*1000;



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
		
		(function (){

			try{
				$charge.myAccountEngine().getSubscriptionInfo().success(function (response) {
					$scope.access_keys = [{
						name: "Primary key",
						key: response.Result.primaryKey
					},{
						name: "Secondary key",
						key: response.Result.secondaryKey
					}];
					$scope.accAccessKeysLoaded = true;

				}).error(function(data) {
					// console.log(data);
					$scope.accAccessKeysLoaded = true;
				});
			}catch(ex){

				$scope.accAccessKeysLoaded = true;

				ex.app = "myAccount";
				logHelper.error(ex);
			}
		})();


		// === load counries==============

		$scope.countries = [];
		$http.get("app/main/account/data/countries.json")
			.then(function(response) {
				$scope.countries = response.data;
			});



		// ===== end ===================



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

			try{
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
					// console.log(response);
					$scope.cardDetails = null;

				});

			}catch(ex){

				$scope.cardDetails = null;

				ex.app = "myAccount";
				logHelper.error(ex);
			}

		}

		$scope.loadCardDetails();



		$scope.isRegisteredWithStripe = false;
		$scope.isRegisteredWith2checkout = false;

		$scope.isRegButtonsShow = true;

		$scope.checkPaymentMethodRegistry = function(){
			try{
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
					// console.log( data);

					$scope.isRegisteredWithStripe = false;
					$scope.isRegisteredWith2checkout = false;
					$scope.isRegButtonsShow = false;

				});
			}catch(ex){
				$scope.isRegisteredWithStripe = false;
				$scope.isRegisteredWith2checkout = false;
				$scope.isRegButtonsShow = false;

				ex.app = "myAccount";
				logHelper.error(ex);
			}
		}

		$scope.checkPaymentMethodRegistry();


		$scope.loadPlanDetails = function(){
			try{

				if($scope.companyPricePlans != null){

					for(var i = 0 ; i <$scope.companyPricePlans.length;i++){
						$scope.companyPricePlans[i].changingPrice = $scope.companyPricePlans[i].price;
						if($scope.companyPricePlans[i].type === 'Yearly')
						{
							$scope.companyPricePlans[i].code = $scope.companyPricePlans[i].code+'_year';
						}
						$scope.getPlansubscription($scope.companyPricePlans[i],$scope.planSubscriptions);
					}
				}

				if(!$scope.selectedPlan && $scope.currentPlanName)
				{
					selectPlan($scope.currentPlanName);
				}

				//$scope.userPrice = ($scope.selectedPlan.planNo > 4) ? 20 : 2;

				// if($scope.selectedPlan.planNo >= 1)
					$scope.getSelectedPlanSubscriptionDetails();
				// else
				// 	$scope.accSubscriptionDetailsLoaded = true;

			}catch(ex){

				$scope.accSubscriptionDetailsLoaded = true;
				ex.app = "myAccount";
				logHelper.error(ex);
			}

		}

		$scope.planSubscriptions= null;
		$scope.getAllPlans = function () {
			try{
				$charge.ratingengine().GetRatePlansForSubscription().success(function (response) {

					$scope.planSubscriptions= response;

					if($scope.planSubscriptions != null && $scope.companyPricePlans!= null && $scope.currentPlanName != null){
						$scope.loadPlanDetails();
					}


				}).error(function(data) {
					// console.log( data);
				});



				$charge.ratingengine().GetPlanDetails().success(function (response) {

					$scope.companyPricePlans = response;

					if($scope.planSubscriptions != null && $scope.companyPricePlans!= null && $scope.currentPlanName != null){
						$scope.loadPlanDetails();
					}

				}).error(function(data) {
					// console.log( data);
				});

			}catch(ex){

				ex.app = "myAccount";
				logHelper.error(ex);
			}

		};

		$scope.getPlansubscription = function (plan,subscriptData) {

			plan.activeSubscriptions = 1000;
			// plan.subscriptionRate = 0;

			for(var i = 0 ; i <subscriptData.length;i++) {
				if(subscriptData[i].type === plan.name)
				{

					var subscript = subscriptData[i].rateDetails;
					plan.allSubscriptionPlans = subscript;

					for(var ii = 0 ; ii <subscript.length;ii++) {
						if(ii === 0)
						{
							plan.subscriptionMinAmount = subscript[ii].rangeTo;
							plan.activeSubscriptions = subscript[ii].rangeTo;
							plan.subscriptionRate = subscript[ii].rate;

						}
						if(ii === (subscript.length - 1))
						{
							plan.subscriptionMaxAmount = subscript[ii].rangeTo;
						}
					}

					// plan.starterSlider = {
					//   value: $scope.currentPlanAmount,
					//   options: {
					//     floor: parseInt(plan.subscriptionMinAmount)-1,
					//     ceil: plan.subscriptionMaxAmount,
					//     step: plan.subscriptionStep,
					//     showSelectionBar: false,
					//     selectionBarGradient: {
					//       from: 'white',
					//       to: '#039be5'
					//     }
					//   }
					// };
				}
			}

		};

		$scope.getAllPlans();

		var selectPlan = function(planId)
		{
			if($scope.companyPricePlans != null) {
				for (var i = 0; i < $scope.companyPricePlans.length; i++) {
					if ($scope.companyPricePlans[i].code === planId) {
						$scope.selectedPlan = $scope.companyPricePlans[i];

						$scope.currentPlanName = $scope.selectedPlan.name;
						$scope.currentPlanCode = $scope.selectedPlan.code;
					}
				}
			}
		}


		//Make Default

		function defaultPayment(selectedPayment,cardDetails){
			try{
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
					// console.log('set card function returned an error '+response);
					notifications.toast("Error, unable to proceed with the operation", "error");


				});

			}catch(ex){

				ex.app = "myAccount";
				logHelper.error(ex);
			}
		}

		$scope.showCurrPlan = function() {

			$scope.currentPlan = $scope.selectedPlan.planNo;
		};

		$scope.tenantUser = [];

		$scope.getUserInfoByID = function() {

			try{
				$charge.myAccountEngine().getUserInfoByID().success(function (response) {

					// console.log(response);
					response.data = response;
					vm.dummy.Data = response.data.Result;
					$scope.tenantUser.firstName = vm.dummy.Data.givenName;
					$scope.tenantUser.surName = vm.dummy.Data.surName;
					$scope.tenantUser.country = vm.dummy.Data.country;

					$scope.tenantId = response.data.Result.domain.split('.')[0];

					if (response.data.Result.UserType === "admin") {
						$scope.isUserAdmin = true;
					}

					$scope.currentPlanName = response.data.Result.plan;

					selectPlan(response.data.Result.plan);

					$scope.calculateFreeTrialExpireDate();

          $http({
            method: "GET" ,
            url: "app/core/cloudcharge/js/config.json"
          }).then(function(data) {
            var publishKey = (data.data.stripe.key);

            $scope.config = {
              title: 'Cloudcharge',
              email: response.data.Result.email,
              publishKey : publishKey,
              description: "for connected business",
              logo: 'app/main/account/img/loginDuo.png',
              label: 'Add Card'
            }

          }, function(response) {

          });



					if ($scope.planSubscriptions != null && $scope.companyPricePlans != null && $scope.currentPlanName != null) {
						$scope.loadPlanDetails();
					}

					$scope.accGeneralLoaded = true;


				}).error(function (data) {
					// console.log(data);
				});

			}catch(ex){

				ex.app = "myAccount";
				logHelper.error(ex);
			}
		}

		$scope.getUserInfoByID();


		$scope.initPlanSliderValue = null;
		$scope.getSelectedPlanSubscriptionDetails = function () {

			// $http({
			// 	method: 'GET',
			// 	url: "http://app.cloudcharge.com/services/duosoftware.ratingEngine/ratingEngine/getAppRule?appID=invoice&plan="+$scope.selectedPlan.code,
			// 	headers: {
			// 		'Content-Type': 'application/json',
			// 		'idToken': $scope.idToken
			// 	}
			// }).then(function (response) {


			$charge.ratingengine().getAppRule("invoice",$scope.selectedPlan.code).success(function (response) {

				//$scope.currentPlanName = response.data.name;
				response.data = response;
				$scope.currentPlanAmount = parseInt(response.data.amount);

				$scope.initPlanSliderValue = parseInt(response.data.amount);
				$scope.currentPlanRate = response.data.rate;
				$scope.additionalCharge = response.data.additionalCharge;
				$scope.currentPlanUsed = response.data.used;
				$scope.currentPlanCreatedDate = response.data.createdDate;
				//callback();

				$scope.subUsage = {
					value: $scope.currentPlanUsed,
					options: {
						floor: 0,
						ceil: parseInt(response.data.amount),
						showSelectionBar: true,
						disabled: true,
						selectionBarGradient: {
							from: '#76d2ff',
							to: '#e28989'
						}
					}
				};

				//Usage
				vm.usageChart = {
					title    : 'Usage',
					chart: {
						options: {
							chart: {
								type     : 'pieChart',
								donut: true,
								color    : ['#039be5','#eeeeee'],
								height   : 320,
								// labelsOutside: true,
								showLegend: false,
								pie: {
									startAngle: function(d) { return d.startAngle/2 -Math.PI/2 },
									endAngle: function(d) { return d.endAngle/2 -Math.PI/2 }
								},
								margin   : {
									top   : 0,
									right : 0,
									bottom: 0,
									left  : 0
								},
								x        : function (d)
								{
									return d.label;
								},
								y        : function (d)
								{
									return d.value;
								},
								tooltip: {
									contentGenerator: function (key, x, y, e, graph) {
										if(key.index == 0){
											vm.tipTitle = 'Used';
										}else{
											vm.tipTitle = 'Available';
										}
										return '<div layout="column" style="background-color: #000;text-align: left;border-radius: 3px;padding: 5px 10px;">'+
											'<div>'+vm.tipTitle+' : '+key.data.value+'</div>' +
											'</div>';
									}
								}
							}
						},
						data   : [{
							'label':'',
							'value':$scope.currentPlanUsed
						},{
							'label':'',
							'value':$scope.initPlanSliderValue - $scope.currentPlanUsed
						}]
					}
				};

				if($scope.selectedPlan){
					$scope.selectedPlan.subscriptionRate = response.data.rate;
					$scope.selectedPlan.sliderValue = response.data.amount;
				}

				for(var i = 0 ; i <$scope.companyPricePlans.length;i++){
					if($scope.companyPricePlans[i].planNo === $scope.selectedPlan.planNo)
					{
						$scope.companyPricePlans[i]= $scope.selectedPlan;

						$scope.changeSubscription($scope.companyPricePlans[i]);
					}
				}

				try{

					//Getting pland end date
					$charge.paymentgateway().subscriberCheck().success(function (data) {

						$scope.currentPlanCreatedDate = moment.unix(data.response[0].currentPeriod).format("YYYY.MM.DD hh:mm a");
						$scope.currentPlanExpiryDate=moment.unix(data.response[0].currentPeriodEnd).format("YYYY.MM.DD hh:mm a");
            $scope.currentPlanAmount = data.response[0].amount;
						// $scope.currentPlanCreatedDate = new Date(data.response[0].currentPeriod).toString();
						// $scope.currentPlanExpiryDate= new Date(data.response[0].currentPeriodEnd).toString();
					}).error(function (data) {
						// console.log(data);
					});
					$scope.accSubscriptionDetailsLoaded = true;

				}catch(ex){

					ex.app = "myAccount";
					logHelper.error(ex);
				}

			}).error(function(data) {

				// console.log(response);
				$scope.accSubscriptionDetailsLoaded = true;
			});
		}


		$scope.calculateFreeTrialExpireDate = function(){

			if($scope.selectedPlan)
			{

				$scope.remainingDays = 0;
				var today = new Date();

				if($scope.selectedPlan.code === 'free_trial' && $scope.freeTrialStartDate != '')
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

					// $scope.remainingDays = (Math.round((convertedDate- today )/(1000*60*60*24))) + " Days remaining";

				}
			}

		}

		$scope.isTenantPaymentHistoryClicked = false;
		$scope.showPaymentHistoryPane = false;
		$scope.getTenantPaymentHistory = function() {

			try{
				$scope.isTenantPaymentHistoryClicked = true;
				$charge.paymentgateway().getAllPaymentByTenant(0, 100, 'cloudcharge').success(function (data) {

					$scope.paymentHistoryList = null;
					$scope.groupedPaymentHistory = [];
					$scope.paymentHistoryList = data;

					for(i=0;i<$scope.paymentHistoryList.length;i++){
						var date = new Date($scope.paymentHistoryList[i].receivedDate);
						var lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 1);
						$scope.paymentHistoryList[i].receivedDate = new Date($scope.paymentHistoryList[i].receivedDate);
						$scope.paymentHistoryList[i].lastDate = lastDay;
						$scope.paymentHistoryList[i].infomation = JSON.parse($scope.paymentHistoryList[i].infomation)[0];

						// Kasun_Wijeratne_31_AUG_2017
						$scope.paymentHistoryList[i].periodForGroup = $scope.paymentHistoryList[i].currentPeriod.split('-')[0]+'-'+$scope.paymentHistoryList[i].currentPeriod.split('-')[1];
						$scope.paymentHistoryList[i].currentPeriod = new Date($scope.paymentHistoryList[i].currentPeriod);
						$scope.paymentHistoryList[i].currentPeriodEnd = new Date($scope.paymentHistoryList[i].currentPeriodEnd);
						// Kasun_Wijeratne_31_AUG_2017 - END
					}

					// Kasun_Wijeratne_31_AUG_2017
					angular.forEach($scope.paymentHistoryList, function (history) {
						var tempObj = {
							id:history.periodForGroup,
							month: new Date(history.periodForGroup+'-01'),
							records:[],
							total:0,
							expanded:false
						}
						if($scope.groupedPaymentHistory.length == 0){
							$scope.groupedPaymentHistory.push(tempObj);
						}
						angular.forEach($scope.groupedPaymentHistory, function (innerHistory) {
							if(history.periodForGroup == innerHistory.id){
								innerHistory.records.push(history);
								innerHistory.total = innerHistory.total + history.amount;
							}else{
								tempObj.records.push(history);
								$scope.groupedPaymentHistory.push(tempObj);
							}
						});
					});
					// Kasun_Wijeratne_31_AUG_2017 - END

					$scope.isTenantPaymentHistoryClicked = false;
					$scope.showPaymentHistoryPane = true;
					$scope.paymentHistory = true;


				}).error(function (data) {
					// console.log(data);
					//$scope.paymentHistoryList = null;
					$scope.isTenantPaymentHistoryClicked = false;
					$scope.showPaymentHistoryPane = true;
				});
			}catch(ex){

				$scope.isTenantPaymentHistoryClicked = false;
				$scope.showPaymentHistoryPane = true;
				ex.app = "myAccount";
				logHelper.error(ex);
			}
		}

		// $scope.getTenantPaymentHistory();


		$scope.deactiveCurrentPlan = function(){  // EOD deactivation


			var confirm = $mdDialog.confirm()
				.title('Deactivate current plan')
				.textContent('Would you like to deactivate current plan?')
				.targetEvent()
				.ok('Yes')
				.cancel('No');

			$mdDialog.show(confirm).then(function() {

				try{
					var disconnectData = {'action':'eod'};
					$charge.paymentgateway().permanentDisconnect(disconnectData).success(function (data) {

						if(data.status)
						{
							$scope.isTempDeactive = false;
							notifications.toast("Operation successful, your subscription period will be ending on "+ $scope.displayExpireDate, "success");

						}else{

							notifications.toast("Subscription disconnection not completed", "error");

						}


					}).error(function (response) {
						// // console.log(response);

						notifications.toast("Subscription disconnection not completed", "error");

					})

				}catch(ex){

					ex.app = "myAccount";
					logHelper.error(ex);
				}

			}, function() {

			});



		}




		$scope.saveProfileDetails = function(isEdit){

			try{
				vm.editableMode = isEdit;
				if(isEdit)
					return;

				if( angular.isUndefined($scope.tenantUser.country) || $scope.tenantUser.country === null || $scope.tenantUser.country === "" ){
					vm.editableMode = true;
					document.getElementById('country').focus();
					return;
				}


				var data = {
					"firstName": $scope.tenantUser.firstName,
					"lastName": $scope.tenantUser.surName,
					"country": $scope.tenantUser.country.name
				}

				$charge.myAccountEngine().updateUser(data).success(function (response) {
					if (response.Result) {

						vm.editableMode = false;
						notifications.toast("User profile updated", "success");
						$scope.getUserInfoByID();
					}else{
						vm.editableMode = true;
						notifications.toast("Error updating details, " + response.data.Message, "error");
					}


				}).error(function(response) {
					// // console.log(response);
					vm.editableMode = true;
					notifications.toast("Error updating details, " + response, "error");
				});

			}catch(ex){

				vm.editableMode = true;
				notifications.toast("Error updating details ", "error");

				ex.app = "myAccount";
				logHelper.error(ex);
			}

		}



		$scope.$on('stripe-token-received', function(event, args) {
			// // console.log(args);

			try{
				if($scope.newCardSelected){

					$http({
						method : 'GET',
						url : "/azureshell/app/main/account/paymentMethod/cardHandler.php?view=addCard&token="+args.id+"&default=true",
						headers: {
							'Content-Type': 'application/json'
						}}).then(function(response) {

						$scope.loadCardDetails();

					}, function(response) {
						// console.log('add card function returned an error '+response);
					});

				} else {
          $scope.isPlanSelected = true;

          var req = {
            method: 'POST',
            url: '/azureshell/app/main/account/paymentMethod/chargeo.php',
            headers: {
              'Content-Type': 'application/json'
            },
              data: {
                "selectedPlan": $scope.selectedPlan.code ,
                "plan":  $scope.paymentPlan ,
                "price" :  ( $scope.paymentPrice) ,
                "name" :  $scope.paymentName ,
                "tenantID" :  $scope.paymentTenant ,
                "stripeToken" :  args.id ,
                "paymentStatus":  $scope.paymentStatus ,
                "subscriptionAmount":  $scope.currentPlanAmount ,
                "additionalUserQty" : 0,
                "additionalUserTotalPrice" : 0
                }
          }
		  
          $http(req).then(function(data){
            if(data.data.status === 'success')
			{
				 $scope.isPlanSelected = false;
				 
				 notifications.toast("Plan successfully changed.", "success");
				 
				 $scope.loadCardDetails();

				$scope.tenantUser = [];
				$scope.getUserInfoByID();
				
				$scope.getSelectedPlanSubscriptionDetails();

				 
			}else{
				notifications.toast("Error while plan changing, " + data.data.message, "error");
				
				$scope.isPlanSelected = false;
			}
          });


         }

			}catch(ex){
				ex.app = "myAccount";
				logHelper.error(ex);
			}

		});


		$scope.addNewCard = function(){
			$scope.newCardSelected = true;
		}

		$scope.removeCard = function (card) {
			try{
				$http({
					method : 'GET',
					url : "/azureshell/app/main/account/paymentMethod/cardHandler.php?view=removeCard&cardId="+card.id,
					headers: {
						'Content-Type': 'application/json'
					}}).then(function(response) {

					$scope.loadCardDetails();

				}, function(response) {
					// console.log('add card function returned an error '+response);
				});

			}catch(ex){

				vm.editableMode = true;
				notifications.toast("Error updating details ", "error");

				ex.app = "myAccount";
				logHelper.error(ex);
			}
		};


		$scope.calculatePlanCharges = function(selectedPlan){

			var planAmount =parseFloat(selectedPlan.changingPrice);
			if(parseFloat($scope.currentPlanUsed) != parseFloat(selectedPlan.activeSubscriptions))
			{
				var differece = parseFloat($scope.currentPlanUsed) - parseFloat(selectedPlan.activeSubscriptions);

				if(differece > 0){

					$scope.userdata = differece;
					var excessPrice = differece * parseFloat(selectedPlan.subscriptionRate);

					planAmount = planAmount+excessPrice;
				}
			}

			return planAmount;
		}


		$scope.selectPlan = function (packaged)
		{


			//var totalPlanAmount = ($scope.calculatePlanCharges(packaged));

			//var amount = totalPlanAmount > parseFloat(packaged.changingPrice) ? totalPlanAmount : parseFloat(packaged.changingPrice);

			/*if($scope.selectedPlan.price > 0 || $scope.paymentStatus === 'canceled') {

				var confirm = $mdDialog.confirm()
					.title('Update Package')
					.textContent('You are going to change your current plan to ' + packaged.name + ' and it will cost amount of $' + amount + ', Do you want to proceed with the update ?')
					.ariaLabel('Lucky day')
					.ok('Yes')
					.cancel('No');
				$mdDialog.show(confirm).then(function () {

					$scope.isPlanSelected= true;
					$scope.submitTenantDetails(packaged);

				}, function () {
					$scope.isPlanSelected = false;
					$mdDialog.hide();
				});

			}else{
				*/
				$scope.submitTenantDetails(packaged);
			//}

		}

		$scope.submitTenantDetails = function (pack) {
			try{
				$scope.paymentTenant = $scope.tenantId ;
				$scope.paymentPlan = pack.code;
				$scope.paymentSecurityToken = $scope.idToken;
				$scope.paymentPrice = (pack.changingPrice);
				$scope.paymentName = pack.name;

			}catch(ex){

				ex.app = "myAccount";
				logHelper.error(ex);
			}
		}


		/*$scope.useRatingEngine = function(numberOfUsers,price) {

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

						// console.log("Rule updated! ");

					}else{

						// console.log("update rule failed! " + response.data);

					}

					notifications.toast("Plan successfully updated ", "success");

					$window.location.reload();

				}, function (response) {
					// console.log("update rule failed! " + response.data);

				});



			}).error(function (data) {
				// console.log(data);
				$scope.isSubmitClicked = false;
				//$scope.addedUsers += $scope.numberOfUsers;
				notifications.toast("Error, unable to proceed with the operation", "error");
				//vm.closeDialog();
			});
		}*/


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

			try{

				//if($scope.user.currentPassword === ''){
				//  notifications.toast("Please enter your current password!", "Error");
				//  return;
				//}
				//else
				if($scope.dev.newPassword === ''){
					notifications.toast("Please enter your new password!", "Error");
					return;
				}
				else if($scope.dev.newPassword != $scope.dev.cnfirmNewPassword){
					notifications.toast("Entered passwords does not match with each other!", "Error");
					return;
				}

				$scope.isChangePasswordSelected = true;

				
				$scope.data = { "password" : $scope.dev.newPassword}
				$charge.myAccountEngine().resetAPIUserPassword($scope.data).success(function (response) {

					var title = "Error";
					//if(dataa.Success)
					//{
					title = "Success";

					$scope.clearPassword();
					//}

					displaycreateCompanyDetailsSubmissionError("Password successfully changed " , title);
					$scope.isChangePasswordSelected = false;


				}).error(function(data) {
					displaycreateCompanyDetailsSubmissionError('Password not been changed duo to '+data ,'Failed to change password');
					$scope.isChangePasswordSelected = false;
				});

			}catch(ex){

				displaycreateCompanyDetailsSubmissionError('Password not been changed ,Failed to change password');
				$scope.isChangePasswordSelected = false;

				ex.app = "myAccount";
				logHelper.error(ex);
			}
		}


		$scope.clearPassword = function(){

			$scope.user = {
				currentPassword : '',
				newPassword : '',
				confirmNewPassword : ''
			};

			$scope.isEditablePassword = !$scope.isEditablePassword;
		}



		$scope.clickCancel = function(){

			$scope.signupsuccess=false;
			$scope.isPlanSelected = false;

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

			try{

				$charge.paymentgateway().subscriberCheck().success(function (data) {

					// console.log(data);


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

					$scope.calculateFreeTrialExpireDate();

				}).error(function (data) {

					if(data.response)
						$scope.paymentStatus = data.response;

				});

			}catch(ex){

				ex.app = "myAccount";
				logHelper.error(ex);
			}

		}

		$scope.addMoreUsers();

		$scope.xfiedKey = 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX';
		$scope.keyIndex = 0;
		$scope.currentlyOn = "";

		$scope.resetKey = function(key){
			$scope.isKeyResetting = true;
		};

		$scope.showAccessKey = function(key, index){
			$scope.keyIndex = index;
			$scope.isKeyHidden = true;
			document.getElementsByClassName('access-key')[index].innerHTML=key.key;
			document.querySelector('.keyDisplay'+key.key+' #show').style.display='none';
			document.querySelector('#copyKey'+key.key).removeAttribute('disabled');
			document.querySelector('.keyDisplay'+key.key+' #hide').style.display='block';
		}

		$scope.hideAccessKey = function(key, index){
			window.getSelection().empty();
			$scope.keyIndex = index;
			var length = key.key.length;
			$scope.isKeyHidden = false;
			document.getElementsByClassName('access-key')[index].innerHTML=$scope.xfiedKey.substring(0, length);
			document.querySelector('#copyKey'+key.key).setAttribute('disabled','disabled');
			document.querySelector('.keyDisplay'+key.key+' #show').style.display='block';
			document.querySelector('.keyDisplay'+key.key+' #hide').style.display='none';
		};

		$scope.copyToClipboard = function (id, elem) {
			$scope.coppiedTimeout = false;
			$scope.copyStarted = true;
			$scope.secondaryCopied = false;
			$scope.primaryCopied = false;
			window.getSelection().empty();
			var ID = "#"+id;
			// var notifParent = document.getElementById(id);
			// var notif = notifParent.getElementsByClassName('copied-to-clipboard')[0];
			var copyField = document.getElementById(id);
			var range = document.createRange();
			range.selectNode(copyField);
			window.getSelection().addRange(range);
			document.execCommand('copy');
			if(elem.split(' ')[0].toLowerCase() == 'primary'){
				$timeout(function(){
					$scope.primaryCopied = true;
				});
			}else{
				$timeout(function() {
					$scope.secondaryCopied = true;
				});
			}
			$timeout(function(){
				$scope.coppiedTimeout = true;
			},2000);
			// if(notif != null || notif != undefined){
			// 	notif.remove();
			// 	copyField.insertAdjacentHTML('beforeend', '<span class="copied-to-clipboard">Copied</span>');
			// }else{
			// 	copyField.insertAdjacentHTML('beforeend', '<span class="copied-to-clipboard">Copied</span>');
			// }
		}

		$scope.showMoreUserInfo=false;
		$scope.contentExpandHandler = function () {
			$scope.reverseMoreLess =! $scope.reverseMoreLess;
			if($scope.reverseMoreLess){
				$scope.showMoreUserInfo=true;
			}else{
				$scope.showMoreUserInfo=false;
			}
		};

		$scope.cancelEdit = function(){
			vm.editableMode = false;
		}

		$scope.dev = {};
		$scope.clearPasswordFields = function () {
			$scope.dev = {};
			vm.devPasswordForm.$setPristine();
			vm.devPasswordForm.$setDirty();
		};

		$scope.saveDevPassword = function () {
			$scope.onPasswordSubmit = true;
			if(vm.devPasswordForm.$valid){
				$scope.onPasswordSubmit = false;
			}else{
				angular.element(document.querySelector('#devPasswordForm')).find('.ng-invalid:visible:first').focus();
				$scope.onPasswordSubmit = false;
			}
		};

		var elem = angular.element('.Header-navClose');
		elem.onclick = function(){
			// console.log('Test clicked');
		}
		//angular.element('.testOnClick').on('click', function(){
		//  // console.log('Test clicked');
		//});


		$scope.getCurrentPlansByUser = function (callback) {

		};

		$scope.getCurrentPlansByUser(function () {
			var firstDate = new Date($scope.currentPlanCreatedDate);
			var secondDate = new Date($scope.currentPlanExpiryDate);
			$scope.remainingDays = Math.round(Math.abs((firstDate.getTime() - secondDate.getTime())/(oneDay)));
		});

		$scope.changeSubscription = function(plan){
			// for(i=0;i<plan.allSubscriptionPlans.length;i++) {
			// 	if(plan.sliderValue <= plan.subscriptionMinAmount){
			// 		plan.subscriptionRate = 0;
			// 		plan.changingPrice =  parseFloat( plan.price ) ;
			// 		if(i===0)
			// 			plan.activeSubscriptions = parseInt(plan.allSubscriptionPlans[i].rangeTo);
			// 	}
			// 	if(plan.sliderValue >= parseInt(plan.allSubscriptionPlans[i].rangeFrom) && plan.sliderValue <= parseInt(plan.allSubscriptionPlans[i].rangeTo)){
			// 		plan.subscriptionRate = parseInt(plan.allSubscriptionPlans[i].rate);
			// 		plan.activeSubscriptions = parseInt(plan.allSubscriptionPlans[i].rangeTo);
			// 		plan.changingPrice = parseFloat(plan.allSubscriptionPlans[i].price);
			// 	}
			// }
			$scope.accSubscriptionDetailsLoaded = true;
		}

		$scope.setRating = function () {
			// console.log(this);
		}

		$scope.sliders = [{}];
		// $scope.$watch(function () {
		// 	if($scope.planSubscriptions != null && $scope.companyPricePlans!= null && $scope.currentPlanName != null && !$scope.isSlidersLoaded) {
		// 		for (i = 0; i < $scope.companyPricePlans.length; i++) {
		// 			if (i > 0) {
		// 				var tickArr=[];
		// 				//tickArr[0] = $scope.companyPricePlans[i].subscriptionMinAmount;
		// 				for(var j=0;j<$scope.companyPricePlans[i].allSubscriptionPlans.length;j++){
		// 					tickArr.push($scope.companyPricePlans[i].allSubscriptionPlans[j].rangeTo);
		// 				}
		// 				$scope.sliders.push({
		// 					sliderValue: $scope.companyPricePlans[i].subscriptionMinAmount,
		// 					options: {
		// 						id: $scope.companyPricePlans[i].code,
		// 						floor: 0,
		// 						enforceStep:true,
		// 						ceil: $scope.companyPricePlans[i].subscriptionMaxAmount,
		// 						step: parseInt($scope.companyPricePlans[i].allSubscriptionPlans[0].rangeTo),
		// 						showSelectionBar: true,
		// 						stepsArray: tickArr,
		// 						selectionBarGradient: {
		// 							from: 'white',
		// 							to: '#039be5'
		// 						}
		// 					}
		// 				});
		// 			}
		// 		}
		// 		$scope.isSlidersLoaded = true;
		// 	}
		// });

		$scope.$on("slideEnded", function(value) {

			for(i=0;i<$scope.companyPricePlans.length;i++){
				if($scope.companyPricePlans[i].code == value.targetScope.slider.options.id){
					for(var a=0;a<$scope.companyPricePlans[i].allSubscriptionPlans.length;a++){
						if($scope.companyPricePlans[i].allSubscriptionPlans[a].rangeTo == value.targetScope.modelLabel){
							$scope.$apply(function () {
								$scope.companyPricePlans[i].subscriptionRate = $scope.companyPricePlans[i].allSubscriptionPlans[a].rate;
								$scope.companyPricePlans[i].changingPrice = $scope.companyPricePlans[i].allSubscriptionPlans[a].price;
								$scope.companyPricePlans[i].activeSubscriptions = $scope.companyPricePlans[i].allSubscriptionPlans[a].rangeTo ;
							});
						}
						//else if(value.targetScope.modelLabel == $scope.companyPricePlans[i].subscriptionMinAmount){
						//  $scope.$apply(function () {
						//    $scope.companyPricePlans[i].subscriptionRate = '0';
						//    $scope.companyPricePlans[i].changingPrice = $scope.companyPricePlans[i].price;
						//    $scope.companyPricePlans[i].activeSubscriptions = $scope.companyPricePlans[i].activeSubscriptions ;
						//  });
						//  // console.log($scope.companyPricePlans[i].subscriptionRate);
						//  // console.log($scope.companyPricePlans[i].changingPrice);
						//  // console.log($scope.companyPricePlans[i].activeSubscriptions);
						//}
					}
				}
			}

		});
		// / DYNAMIC PLANS


		// SUBSCRIPTION HISTORY PDF DOWNLOADER
		$scope.downloadSubscriptionPDF = function (record) {
			record.downloading = true;

			// var lastDateTimestamp = new Date(record.lastDate + ' UTC').getTime()/1000;
			// var receivedDateTimestamp = new Date(record.receivedDate + ' UTC').getTime()/1000;


			// lastDate = lastDate.split("-");
			// var lastDateTimestamp = lastDate[1]+"/"+lastDate[2]+"/"+lastDate[0];
			// alert(new Date(newDate).getTime());

			// $http({
			// 	method: 'POST',
			// 	url: 'http://azure.cloudcharge.com/services/duosoftware.EmailGatewayAPI/email/downloadSubscriptionPDF',
			// 	headers: {
			// 		'Content-Type': 'application/json',
			// 		'idToken' : $scope.idToken
			// 	},
			// 	data:[{
			// 		"type": "PDF",
			// 		"id": record.id,
			// 		"amount": record.amount,
			// 		"email": parseJwt($scope.idToken).emails[0],
			// 		"currency": "usd",
			// 		"infomation": JSON.stringify([record.infomation]),
			// 		"domain": window.location.hostname,
			// 		"currentPeriod": receivedDateTimestamp,
			// 		"currentPeriodEnd": lastDateTimestamp,
			// 		"createdDate": receivedDateTimestamp,
			// 		"gatewayType": "stripe"
			// 	}]
			// }).then(function (successResponse) {
			// 	$scope.subscriptionDateForPDF = record.receivedDate;
			// 	var pdf = 'data:application/octet-stream;base64,' + successResponse.data.encodedResult;
			// 	var dlnk = document.getElementById('hidden-donwload-anchor');
			// 	$timeout(function(){
			// 		dlnk.href = pdf;
			// 		dlnk.click();
			// 	},100);
			// 	record.downloading = false;
			// }, function (errorResponse) {
			// 	// console.log(errorResponse)
			// 	record.downloading = false;
			// });

			$scope.dataInfo = [];
			var currentPeriod = null;
			var currentPeriodEnd = null;
			var receivedDate = null;
			angular.forEach(record.records, function(record){
				var tempItemObj = {
					amount: record.amount,
					feature: record.infomation.feature,
					quantity:record.infomation.quantity
				};
				$scope.dataInfo.push(tempItemObj);
				if(record.infomation.tag.toLowerCase() == 'package'){
					currentPeriod = record.currentPeriod;
					currentPeriodEnd = record.currentPeriodEnd;
					receivedDate = record.receivedDate;
				}
			});

			$scope.data=[{
				"type": "PDF",
				"id": record.records[0].id,
				"amount": record.total,
				"email": vm.dummy.Data.email,
				"currency": "usd",
				"infomation": JSON.stringify($scope.dataInfo),
				"domain": record.records[0].domain,
				"currentPeriod": new Date(currentPeriod+ ' UTC').getTime()/1000,
				"currentPeriodEnd": new Date(currentPeriodEnd+ ' UTC').getTime()/1000,
				"createdDate": new Date(receivedDate+ ' UTC').getTime()/1000,
				"gatewayType": "stripe"
			}];
			$charge.document().downloadSubscriptionPDF($scope.data).success(function (successResponse) {

				$scope.subscriptionDateForPDF = record.receivedDate;
				var pdf = 'data:application/octet-stream;base64,' + successResponse.encodedResult;
				var dlnk = document.getElementById('hidden-donwload-anchor');
				$timeout(function(){
					dlnk.href = pdf;
					dlnk.click();
				},100);
				record.downloading = false;

			}).error(function(errorResponse) {
				record.downloading = false;
			});


		}
		// SUBSCRIPTION HISTORY PDF DOWNLOADER

		$scope.expandPaymentRecord = function (record) {
			record.expanded = !record.expanded;
		};

		// Reset access keys
		$scope.resetLoading = false;
		$scope.resetAccessKeys = function (keyCat) {
			// $scope.resetLoading = true;
			// $http.get('app/main/account/accessKeys/resetAccessKeys.php/?id='+$scope.idToken+'&&resetType=primary').then(function (successResponse) {
			// 	$scope.newPrimaryKey = successResponse;
			// 	$scope.resetLoading = false;
			// }, function (errorResponse) {
			// 	$scope.resetLoading = false;
			// });
			try{

				$scope.resetLoading = true;
				$scope.currentlyResetting = keyCat;
				if(keyCat.toLowerCase() == 'primary key'){


					$charge.myAccountEngine().regeneratePrimaryKey().success(function (response) {
						$timeout(function () {
							$scope.access_keys = [{
								name: "Primary key",
								key: response.Result.primaryKey
							},{
								name: "Secondary key",
								key: response.Result.secondaryKey
							}];
						});
						notifications.toast("Primary key has been reset", "success");
						$scope.resetLoading = false;

					}).error(function (errorRes) {
						$scope.resetLoading = false;
					});


				}else if(keyCat.toLowerCase() == 'secondary key'){

					$charge.myAccountEngine().regeneratePrimaryKey().success(function (response) {
						$timeout(function () {
							$scope.access_keys = [{
								name: "Primary key",
								key: response.Result.primaryKey
							},{
								name: "Secondary key",
								key: response.Result.secondaryKey
							}];
						});
						notifications.toast("Secondary key has been reset", "success");
						$scope.resetLoading = false;

					}).error(function (errorRes) {
						$scope.resetLoading = false;
					});

				}
			}catch(ex){
				$scope.resetLoading = false;

				ex.app = "myAccount";
				logHelper.error(ex);
			}
		}
		// Reset access keys - END

	}
})();

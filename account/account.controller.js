
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
		//$scope.isDefaultPayment = '1';
		//$scope.defaultPayment = defaultPayment;
		$scope.admin = true;
		$scope.normal = false;
		$scope.isEditablePassword = false;
    $scope.promoCode = '';
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

		var selectPlan = function(planCode)
		{
			if($scope.allPlans != null) {
				for (var i = 0; i < $scope.allPlans.length; i++) {
					if ($scope.allPlans[i].code === planCode) {
						$scope.selectedPlan = $scope.allPlans[i];
						$scope.tempSelectedPlan = $scope.selectedPlan ;
						$scope.currentPlanName = $scope.selectedPlan.name;

						$scope.radioButtonSelectedPlan($scope.selectedPlan);
					}
				}
			}
		}

		$scope.idToken= gst('securityToken');

		(function (){

			try{

				var domain = gst('currentDomain');
				if(!domain)
				{
					domain = gst('domain');
				}
				$charge.tenantEngine().getSubscriptionIdByTenantName(domain).success(function (response) {

					if(response.status) {
						var subscriptionID = response.data["0"].subscriptionID;

						if (subscriptionID) {

							$charge.myAccountEngine().getSubscriptionInfoByID(subscriptionID).success(function (data) {

								$scope.access_keys = [{
									name: "Primary key",
									key: data.Result.primaryKey
								}, {
									name: "Secondary key",
									key: data.Result.secondaryKey
								}];
								$scope.accAccessKeysLoaded = true;

							}).error(function (data) {
								// console.log(data);
								$scope.accAccessKeysLoaded = true;
							});

						} else {
							$scope.accAccessKeysLoaded = true;
						}
					} else {
						$scope.accAccessKeysLoaded = true;
					}

				}).error(function(data) {
					// console.log(data);
					$scope.accAccessKeysLoaded = true;

					ex.app = "myAccount";
					logHelper.error(ex);

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

					$scope.getProfile(vm.dummy.Data.email);
					//$scope.calculateFreeTrialExpireDate();

					//$http({
					//	method: "GET" ,
					//	url: "app/core/cloudcharge/js/config.json"
					//}).then(function(data) {
					//	var publishKey = (data.data.stripe.key);
                    //
					//	$scope.config = {
					//		title: 'Cloudcharge',
					//		email: response.data.Result.email,
					//		publishKey : publishKey,
					//		description: "for connected business",
					//		logo: 'app/main/account/img/loginDuo.png',
					//		label: 'Add Card'
					//	}
                    //
					//}, function(response) {
                    //
					//});


					$scope.accGeneralLoaded = true;


				}).error(function (data) {
					console.log(data);
				});

			}catch(ex){

				ex.app = "myAccount";
				logHelper.error(ex);
			}
		}

		$scope.getUserInfoByID();





		$scope.loadCardDetails = function() {

			try{

				var profileId = $scope.customerDetails.profileId;

				$charge.myaccountapi().cardAPIgetCustomer(profileId).success(function (response) {
					if(response.status) {
						$scope.cardDetails = response.data.data;
            if($scope.cardDetails) {
              for (var i = 0; i < $scope.cardDetails.length; i++) {
                $scope.cardDetails[i].rowId = i;
              }
            }else{
              $scope.cardDetails = null;
            }
					}

				}).error(function(data) {

          $scope.cardDetails = null;

				});

			}catch(ex){

				$scope.cardDetails = null;

				ex.app = "myAccount";
				logHelper.error(ex);
			}

		}


		$scope.allPlans= null;
		$scope.planAddons= null;
		$scope.tempSelectedPlan = null;
		$scope.selectedAddons = [];

		$scope.getAllPlans = function () {

			try{
				$charge.myaccountapi().allPlanslocal(0,10,'asc').success(function (response) {

					if(response.status) {
						$scope.allPlans = response.data;
            $scope.getPlanPromotions();
            $scope.getActiveSubscriptionDetails();
					}

				}).error(function(data) {

					$scope.allPlans= null;
				});

			}catch(ex){

        $scope.allPlans= null;

				ex.app = "myAccount";
				logHelper.error(ex);
			}

		};


		$scope.getAllPlans();


    $scope.getPlanPromotions = function () {

      if($scope.allPlans != null) {

        var planIds = [];
        for (var i = 0; i < $scope.allPlans.length; i++) {
          planIds.push({"planId": $scope.allPlans[i].guPlanID});

          if($scope.allPlans[i].taxID != "") {
            $scope.getTaxGroupDetails($scope.allPlans[i].taxID);
          }

        }

        try {
          $charge.myaccountapi().getPromotionByPlanIdList(planIds).success(function (response) {

            if (response.status) {
              for (var i = 0; i < $scope.allPlans.length; i++) {
                if(response.data[$scope.allPlans[i].guPlanID] != null){ // code did asuming that it is one promotion at a time for a plan.
                  $scope.allPlans[i].hasPromotion = true;
                  $scope.allPlans[i].promotionCode = response.data[$scope.allPlans[i].guPlanID]["0"].couponcode;
                  $scope.allPlans[i].discountamount = response.data[$scope.allPlans[i].guPlanID]["0"].discountamount;
                  $scope.allPlans[i].discounttype = response.data[$scope.allPlans[i].guPlanID]["0"].discounttype;
                }
              }
            }

          }).error(function (data) {

          });

        } catch (ex) {
          ex.app = "myAccount";
          logHelper.error(ex);
        }

      }
    };

    $scope.planTax = [];
    $scope.getTaxGroupDetails = function(taxGroupId){
      try {
        $charge.myaccountapi().getTaxGropById(taxGroupId).success(function (response) {

          if (response.status) {
            //response.data.groupDetail["0"].taxgroupid
              $scope.planTax.push(response.data);
              $scope.calcPlanTax();

          }

        }).error(function (data) {
          $scope.planTax = [];
        });

      } catch (ex) {
        $scope.planTax = [];
        ex.app = "myAccount";
        logHelper.error(ex);
      }

    };


    $scope.calcPlanTax = function(){
      $scope.taxDetails = [];
      for (var i = 0; i <  $scope.planTax.length; i++) { //["0"]["0"].groupDetail["0"].amount
          for (var ii = 0; ii <  $scope.planTax[i].length; ii++) {
            for (var iii = 0; iii <  $scope.planTax[i][ii].groupDetail.length; iii++) {
              $scope.taxDetails.push({"taxId":$scope.planTax[i][ii].groupDetail[iii].taxgroupid,"amount":$scope.planTax[i][ii].groupDetail[iii].amount,"amounttype":$scope.planTax[i][ii].groupDetail[iii].amounttype})
            }
          }
      }


        for (var iz = 0; iz < $scope.taxDetails.length; iz++) {
          for (var i = 0; i < $scope.allPlans.length; i++) {
            if ($scope.allPlans[i].taxID != "") {
              if (parseInt($scope.allPlans[i].taxID) === $scope.taxDetails[iz].taxId) {
                if($scope.allPlans[i].taxamount === undefined)
                  $scope.allPlans[i].taxamount = 0;

                $scope.allPlans[i].taxamount = parseFloat($scope.allPlans[i].taxamount) + parseFloat($scope.taxDetails[iz].amount);
                $scope.allPlans[i].taxtype = $scope.taxDetails[iz].amounttype;
              }
            }
          }
      }

    }


		$scope.addonsLoaded = true;
		$scope.radioButtonSelectedPlan = function(radioButtonPlan){
			$scope.addonsLoaded = false;
			$scope.tempSelectedPlan = radioButtonPlan;
			$scope.planAddons = null;
			$scope.updatePackgeFeatures(radioButtonPlan);

      var amount = radioButtonPlan.unitPrice;

      if(radioButtonPlan.code != 'free_trial') {
        if (radioButtonPlan.discounttype === 1) {
          amount = amount - ((amount * radioButtonPlan.discountamount) / 100);
        } else {
          amount = amount - radioButtonPlan.discountamount;
        }

        if (radioButtonPlan.taxamount != undefined) {

          if (radioButtonPlan.taxtype === '1') {
            amount = amount + ((amount * radioButtonPlan.taxamount) / 100);
          } else {
            amount = amount + radioButtonPlan.taxamount;
          }
        }
      }else {
        amount = 0;
      }
        $scope.calculateCost(null, amount );
			$charge.myaccountapi().getAddonsForBasePlan(radioButtonPlan.code).success(function (response) {

				if(response.status) {
					if(response.data.length > 0){
						$scope.planAddons=response.data;
						angular.forEach($scope.planAddons, function (addon) {
							addon.isChecked = false;
						});
						$scope.addonsLoaded = true;
					}

					if(response.data.Authenticated != undefined)
					{
						$scope.planAddons=null;
						$scope.addonsLoaded = true;
					}
					$scope.addonsLoaded = true;
				}else{
					$scope.addonsLoaded = true;
				}

			}).error(function(data) {
				$scope.planAddons= null;
				$scope.addonsLoaded = true;
			});

		};


		$scope.initPlanSliderValue = null;
		$scope.activeSubscription = null;
		$scope.getActiveSubscriptionDetails = function () {
			try{
				$charge.myaccountapi().getActiveSubscription(vm.dummy.Data.email).success(function (response) {

					if(response.response === "succeeded") {

						if(response.data.result.length > 0) {
              $scope.activeSubscription = response.data.result;
              for(var i = 0;i < response.data.result.length; i++) {

                if(response.data.result[i].class === "Base-Plan") {


                  $scope.currentPlanCode = response.data.result[i].code
                  selectPlan($scope.currentPlanCode);
                  $scope.currentPlanAmount = parseFloat(response.data.result[i].amount);

                  $scope.selectedAddonCodes = [];
                  if (response.data.result[i].addOns && response.data.result[i].addOns.length > 0) {
                    for (var iz = 0; iz < response.data.result[i].addOns.length; iz++) {
                      $scope.selectedAddonCodes.push(response.data.result[i].addOns[iz].code);
                    }
                  }

                  $scope.initPlanSliderValue = "25";
                  $scope.currentPlanUsed = '0';


                  $scope.currentPlanCreatedDate = response.data.result[i].startDate;
                  $scope.currentPlanExpiryDate = response.data.result[i].endDate;
                  //callback();

                  $scope.subUsage = {
                    value: $scope.currentPlanUsed,
                    options: {
                      floor: 0,
                      ceil: $scope.currentPlanAmount,
                      showSelectionBar: true,
                      disabled: true,
                      selectionBarGradient: {
                        from: '#76d2ff',
                        to: '#e28989'
                      }
                    }
                  };

                  //Usage
                  $timeout(function () {
                    vm.usageChart = {
                      title: 'Usage',
                      chart: {
                        options: {
                          chart: {
                            type: 'pieChart',
                            donut: true,
                            color: ['#039be5', '#eeeeee'],
                            height: 320,
                            // labelsOutside: true,
                            showLegend: false,
                            pie: {
                              startAngle: function (d) {
                                return d.startAngle / 2 - Math.PI / 2
                              },
                              endAngle: function (d) {
                                return d.endAngle / 2 - Math.PI / 2
                              }
                            },
                            margin: {
                              top: 0,
                              right: 0,
                              bottom: 0,
                              left: 0
                            },
                            x: function (d) {
                              return d.label;
                            },
                            y: function (d) {
                              return d.value;
                            },
                            tooltip: {
                              contentGenerator: function (key, x, y, e, graph) {
                                if (key.index == 0) {
                                  vm.tipTitle = 'Used';
                                } else {
                                  vm.tipTitle = 'Available';
                                }
                                return '<div layout="column" style="background-color: #000;text-align: left;border-radius: 3px;padding: 5px 10px;">' +
                                  '<div>' + vm.tipTitle + ' : ' + key.data.value + '</div>' +
                                  '</div>';
                              }
                            }
                          }
                        },
                        data: [{
                          'label': '',
                          'value': parseInt($scope.currentPlanUsed)
                        }, {
                          'label': '',
                          'value': parseInt($scope.initPlanSliderValue) - parseInt($scope.currentPlanUsed)
                        }]
                      }
                    };
                  });

                  $scope.currentPlanAmount = response.data.result[i].amount;
                }
              }
						}else{

							$scope.currentPlanCode = 'free_trial';
							selectPlan($scope.currentPlanCode);


						}

						$scope.accSubscriptionDetailsLoaded = true;




					}else{

						$scope.accSubscriptionDetailsLoaded = true;

					}

				}).error(function(data) {

					$scope.accSubscriptionDetailsLoaded = true;
				});

			}catch(ex){
				ex.app = "myAccount";
				logHelper.error(ex);

				$scope.accSubscriptionDetailsLoaded = true;
			}
		}

		// select addon check box
		$scope.toggleSelection = function(addon) {
debugger;
			try{
				var idx = $scope.selectedAddons.indexOf(addon);

				// is currently selected
				if (idx > -1) {
					$scope.selectedAddons.splice(idx, 1);
				}

				// is newly selected
				else {
					$scope.selectedAddons.push(addon);
				}
			}catch(ex){
				ex.app = "myAccount";
				logHelper.error(ex);
			}
		};

		$scope.selectPlan = function ()
		{

			if(!$scope.selectedPlan || $scope.selectedPlan === null){
				notifications.toast("There is a error loading user plan, Please load My Profile application again", "error");
				return;
			}

			if(!$scope.customerDetails.stripeCustId){
				notifications.toast("Please add card details first to proceed", "error");
				$scope.addNewCard('insert');
				return;
			}

			$scope.isPlanSelected = true;

			if($scope.tempSelectedPlan === null)
			{
				notifications.toast("Please select new plan to update ", "error");
				$scope.isPlanSelected = false;
				return;
			}else {
				var pack = $scope.tempSelectedPlan;
				try {
					$scope.paymentTenant = $scope.tenantId;
					$scope.paymentPlan = pack.code;
					$scope.paymentPrice = (pack.unitPrice);
					$scope.paymentName = pack.name;

				} catch (ex) {
					$scope.isPlanSelected = false;
					ex.app = "myAccount";
					logHelper.error(ex);
				}
			}

			var addons = [];
			if($scope.selectedAddons.length > 0){
				for(var i=0;i<$scope.selectedAddons.length;i++){
					addons[i]={"code" : $scope.selectedAddons[i].code, "qty":1}
				}
			}

      var confirm = $mdDialog.confirm()
        .title('Buy new plan')
        .textContent('Would you like to buy selected Plan?')
        .targetEvent()
        .ok('Yes')
        .cancel('No');

      $mdDialog.show(confirm).then(function() {

			  $scope.changeSubscription($scope.tempSelectedPlan.code);

      }, function() {
        $scope.isPlanSelected = false;
      });

		}

		$scope.isChangeSubscriptionClicked = false;
		$scope.changeSubscription = function(newPlan){

			$scope.isChangeSubscriptionClicked = true;

			var data = {
				"email": vm.dummy.Data.email,
				"newplanCode": newPlan,
				"oldplanCode": $scope.selectedPlan.code,
				"qty": 1,
				"note": "note",
				"changeType": "immediate",
        //"addOns": $scope.selectedAddons,
        "coupon": $scope.promoCode
			}

			$charge.myaccountapi().changeSubscriptionlocal(data).success(function (response) {
				$scope.isPlanSelected = false;
				if(response.response === "succeeded") {

					notifications.toast("Plan successfully changed", "success");
					$scope.switchPlan(newPlan);

					$scope.isChangeSubscriptionClicked = false;
					//$scope.tenantUser = [];
					//$scope.getUserInfoByID();
					//$scope.getActiveSubscriptionDetails();
					$scope.currentPlanCode = newPlan;
					selectPlan($scope.currentPlanCode);

				}else{
					notifications.toast("Error occured while changing plans", "error");
					$scope.isChangeSubscriptionClicked = false;
				}

			}).error(function(data) {
				$scope.isPlanSelected = false;
				notifications.toast("Error occured while changing plans", "error");
				$scope.isChangeSubscriptionClicked = false;
			});

		}


    //addSubscription
    $scope.addAddon = function(){

      var confirm = $mdDialog.confirm()
        .title('Buy new add-on')
        .textContent('Would you like to buy selected Add-on(s)?')
        .targetEvent()
        .ok('Yes')
        .cancel('No');

      $mdDialog.show(confirm).then(function() {

        if($scope.selectedAddons != undefined && $scope.selectedAddons.length > 0) {

          $scope.isPlanSelected = true;

          for (var i = 0; i < $scope.selectedAddons.length; i++) {
            var addon = $scope.selectedAddons[i];
            var data = {
              "email": vm.dummy.Data.email,
              "planCode": addon.code,
              "note": "Add Addon",
              "qty": addon.qty,
              "startDate": $filter('date')(new Date(), 'yyyy-MM-dd'),
              "addOns": [],
              "coupon": ""
            }

            $charge.myaccountapi().addSubscriptionlocal(data).success(function (response) {
              $scope.isPlanSelected = false;
              if (response.response != "failed") {

                notifications.toast("Add-on (" + addon.name + ") successfully purchased", "success");

              } else {

                if (response.error.STATUS_INTERNAL_SERVER_ERROR) {

                  notifications.toast(response.error.STATUS_INTERNAL_SERVER_ERROR["0"], "error");


                } else {
                  notifications.toast("Error occured while changing Add-on(" + addon.name + ")", "error");
                }

              }

            }).error(function (data) {
              $scope.isPlanSelected = false;
              notifications.toast("Error occured while changing Add-on(" + addon + ")", "error");
            });
          }
        }

      }, function() {
        $scope.isPlanSelected = false;
      });

		}

		$scope.addNewCard = function(action){

			var data = {
				"profileId": $scope.customerDetails.profileId,
				"redirectUrl": window.location.href,
				"action": action
			}

			$scope.cardBody = null;
			$charge.myaccountapi().loadForm(data).success(function (response) {
				$scope.cardBody = response;

				$("#cardBody").append($scope.cardBody);
				$("#cardBody_").append($scope.cardBody);
				// $scope.addCardDialog(this,response);

			}).error(function(data) {
				notifications.toast("Error occured while changing plans", "error");
			});

		}

		//$scope.addCardDialog = function (ev,formBody) {
		//	$mdDialog.show({
		//		controller: 'AddCardController as vm',
		//		templateUrl: 'app/main/account/dialogs/addCardDialog.html',
		//		parent: angular.element(document.body),
		//		targetEvent: ev,
		//		clickOutsideToClose:true,
		//		locals : {
		//			body : formBody
        //
		//		}
		//	})
		//		.then(function(answer) {
        //
		//		}, function() {
        //
		//		});
		//}

		$scope.switchPlan = function(plan){

			$charge.currency().switchPlan(plan).success(function (response) {
				// notifications.toast("Plan successfully changed", "success");
			}).error(function(data) {
				// notifications.toast("Error occured while switching plans", "error");
			});

		}

		$scope.customerDetails = {};
		$scope.getProfile = function(email){

			$charge.myaccountapi().getProfile(0,1,'asc','email',email).success(function (response) {
				if(response.status) {

					$scope.customerDetails = response.data['0'];

					$scope.loadCardDetails();

					if($scope.customerDetails.stripeCustId === null){
						$scope.addNewCard('insert');
					}else{
						$scope.addNewCard('update');
					}

				}

			}).error(function(data) {

				$scope.allPlans= null;
			});

		}


		//$scope.calculateFreeTrialExpireDate = function(){
        //
		//	if($scope.selectedPlan)
		//	{
        //
		//		$scope.remainingDays = 0;
		//		var today = new Date();
        //
		//		if($scope.selectedPlan.code === 'free_trial' && $scope.freeTrialStartDate != '')
		//		{
		//			var convertedDate = new Date($scope.freeTrialStartDate);
        //
        //
		//			convertedDate.setDate(convertedDate.getDate() + parseInt($scope.selectedPlan.period));
        //
		//			$scope.remainingDays = (Math.round((convertedDate- today )/(1000*60*60*24))) +  " Days remaining";
        //
		//			$scope.displayExpireDate = moment(convertedDate.toISOString()).format('LL');
		//		}
		//		else
		//		{
		//			$scope.displayExpireDate = $scope.paidPlanExpireDate;
        //
		//			var convertedDate = new Date($scope.paidPlanExpireDate);
        //
		//			// $scope.remainingDays = (Math.round((convertedDate- today )/(1000*60*60*24))) + " Days remaining";
        //
		//		}
		//	}
        //
		//}

		$scope.isTenantPaymentHistoryClicked = false;
		$scope.showPaymentHistoryPane = false;
		$scope.getTenantPaymentHistory = function() {

			var email = $scope.customerDetails.email_addr;

			try{
				$scope.isTenantPaymentHistoryClicked = true;
				$charge.myaccountapi().getPaymentDetailsByEmail(email).success(function (data) {

					$scope.paymentHistoryList = null;
					$scope.groupedPaymentHistory = [];
					$scope.paymentHistoryList = data.data.result;

					for (i = 0; i < $scope.paymentHistoryList.length; i++) {
						var date = new Date($scope.paymentHistoryList[i].createdDate);
						var lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 1);
						$scope.paymentHistoryList[i].receivedDate = new Date($scope.paymentHistoryList[i].createdDate);
						$scope.paymentHistoryList[i].lastDate = lastDay;
						//$scope.paymentHistoryList[i].infomation = JSON.parse($scope.paymentHistoryList[i].infomation)[0];
						$scope.paymentHistoryList[i].infomation = $scope.paymentHistoryList[i].note;
						$scope.paymentHistoryList[i].currency = $scope.paymentHistoryList[i].currency;

						// Kasun_Wijeratne_31_AUG_2017
						//$scope.paymentHistoryList[i].periodForGroup = $scope.paymentHistoryList[i].currentPeriod.split('-')[0] + '-' + $scope.paymentHistoryList[i].currentPeriod.split('-')[1];
						//$scope.paymentHistoryList[i].currentPeriod = new Date($scope.paymentHistoryList[i].currentPeriod);
						//$scope.paymentHistoryList[i].currentPeriodEnd = new Date($scope.paymentHistoryList[i].currentPeriodEnd);
						$scope.paymentHistoryList[i].periodForGroup = $scope.paymentHistoryList[i].createdDate + '-' + $scope.paymentHistoryList[i].lastDate;
						$scope.paymentHistoryList[i].currentPeriod = new Date($scope.paymentHistoryList[i].createdDate);
						$scope.paymentHistoryList[i].currentPeriodEnd = new Date($scope.paymentHistoryList[i].lastDate);
						// Kasun_Wijeratne_31_AUG_2017 - END
					}

					// Kasun_Wijeratne_31_AUG_2017
					//angular.forEach($scope.paymentHistoryList, function (history) {
					//  var tempObj = {
					//    id: history.periodForGroup,
					//    month: new Date(history.periodForGroup + '-01'),
					//    records: [],
					//    total: 0,
					//    expanded: false
					//  }
					//  if ($scope.groupedPaymentHistory.length == 0) {
					//    $scope.groupedPaymentHistory.push(tempObj);
					//  }
					//  angular.forEach($scope.groupedPaymentHistory, function (innerHistory) {
					//    if (history.periodForGroup == innerHistory.id) {
					//      innerHistory.records.push(history);
					//      innerHistory.total = innerHistory.total + history.amount;
					//    } else {
					//      tempObj.records.push(history);
					//      $scope.groupedPaymentHistory.push(tempObj);
					//    }
					//  });
					//});
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

				$scope.changeSubscription('free_trial');

			}, function() {
        $scope.isPlanSelected = false;
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



		//$scope.$on('stripe-token-received', function(event, args) {
		//	// // console.log(args);
        //
		//	try{
		//		if($scope.newCardSelected){
        //
		//			$http({
		//				method : 'GET',
		//				url : "/azureshell/app/main/account/paymentMethod/cardHandler.php?view=addCard&token="+args.id+"&default=true",
		//				headers: {
		//					'Content-Type': 'application/json'
		//				}}).then(function(response) {
        //
		//				$scope.loadCardDetails();
        //
		//			}, function(response) {
		//				// console.log('add card function returned an error '+response);
		//			});
        //
		//		} else {
		//			$scope.isPlanSelected = true;
        //
		//			var req = {
		//				method: 'POST',
		//				url: '/azureshell/app/main/account/paymentMethod/chargeo.php',
		//				headers: {
		//					'Content-Type': 'application/json'
		//				},
		//				data: {
		//					"selectedPlan": $scope.selectedPlan.code ,
		//					"plan":  $scope.paymentPlan ,
		//					"price" :  ( $scope.paymentPrice) ,
		//					"name" :  $scope.paymentName ,
		//					"tenantID" :  $scope.paymentTenant ,
		//					"stripeToken" :  args.id ,
		//					"paymentStatus":  $scope.paymentStatus ,
		//					"subscriptionAmount":  $scope.currentPlanAmount ,
		//					"additionalUserQty" : 0,
		//					"additionalUserTotalPrice" : 0
		//				}
		//			}
        //
		//			$http(req).then(function(data){
		//				if(data.data.status === 'success')
		//				{
		//					$scope.isPlanSelected = false;
        //
		//					notifications.toast("Plan successfully changed.", "success");
        //
		//					$scope.loadCardDetails();
        //
		//					$scope.tenantUser = [];
		//					$scope.getUserInfoByID();
        //
		//					//$scope.getSelectedPlanSubscriptionDetails();
        //
        //
		//				}else{
		//					notifications.toast("Error while plan changing, " + data.data.message, "error");
        //
		//					$scope.isPlanSelected = false;
		//				}
		//			});
        //
        //
		//		}
        //
		//	}catch(ex){
		//		ex.app = "myAccount";
		//		logHelper.error(ex);
		//	}
        //
		//});


		//$scope.addNewCard = function(){
		//	$scope.newCardSelected = true;
		//}

		//$scope.removeCard = function (card) {
		//	try{
		//		$http({
		//			method : 'GET',
		//			url : "/azureshell/app/main/account/paymentMethod/cardHandler.php?view=removeCard&cardId="+card.id,
		//			headers: {
		//				'Content-Type': 'application/json'
		//			}}).then(function(response) {
		//
		//			$scope.loadCardDetails();
		//
		//		}, function(response) {
		//			// console.log('add card function returned an error '+response);
		//		});
		//
		//	}catch(ex){
		//
		//		vm.editableMode = true;
		//		notifications.toast("Error updating details ", "error");
		//
		//		ex.app = "myAccount";
		//		logHelper.error(ex);
		//	}
		//};


		//$scope.calculatePlanCharges = function(selectedPlan){
        //
		//	var planAmount =parseFloat(selectedPlan.unitPrice);
		//	if(parseFloat($scope.currentPlanUsed) != parseFloat(selectedPlan.activeSubscriptions))
		//	{
		//		var differece = parseFloat($scope.currentPlanUsed) - parseFloat(selectedPlan.activeSubscriptions);
        //
		//		if(differece > 0){
        //
		//			$scope.userdata = differece;
		//			var excessPrice = differece * parseFloat(selectedPlan.subscriptionRate);
        //
		//			planAmount = planAmount+excessPrice;
		//		}
		//	}
        //
		//	return planAmount;
		//}





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
			//$mdDialog.show({
			//	controller: 'AddUsersController as vm',
			//	templateUrl: 'app/main/account/dialogs/addCardDialog.html',
			//	parent: angular.element(document.body),
			//	targetEvent: ev,
			//	clickOutsideToClose:false,
			//	locals : {
			//		numberOfUser : $scope.numberOfUsers,
			//		userPrice:$scope.userPrice
			//
			//	}
			//})
			//	.then(function(answer) {
			//
			//		$scope.addMoreUsers();
			//		$scope.getTenantPaymentHistory();
			//
			//	}, function() {
			//	});
		}



		//$scope.userdata=0;
		//$scope.paymentStatus = "";
		//$scope.isTempDeactive = false;
        //
		//$scope.addMoreUsers = function () {
        //
		//	try{
        //
		//		$charge.paymentgateway().subscriberCheck().success(function (data) {
        //
		//			// console.log(data);
        //
        //
		//			$scope.paymentStatus = data.response[0].status;
		//			if( data.response[0].planStatus === 'Active')
		//			{
		//				$scope.isTempDeactive = true;
		//			}
        //
		//			for (var i = 0; i < data.response[0].otherInfo.length; i++) {
		//				if(data.response[0].otherInfo[i].tag === 'user')
		//				{
		//					$scope.userdata = data.response[0].otherInfo[i].quantity;
		//				}
		//			}
        //
		//			var planEndDate = $filter('date')((data.response[0].currentPeriodEnd * 1000), 'yyyy-MM-dd');
		//			$scope.paidPlanExpireDate = planEndDate;
		//			//moment(convertedDate.toISOString()).format('LL');
        //
		//			$scope.calculateFreeTrialExpireDate();
        //
		//		}).error(function (data) {
        //
		//			if(data.response)
		//				$scope.paymentStatus = data.response;
        //
		//		});
        //
		//	}catch(ex){
        //
		//		ex.app = "myAccount";
		//		logHelper.error(ex);
		//	}
        //
		//}
        //
		//$scope.addMoreUsers();

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
			$scope.showMoreUserInfo =! $scope.showMoreUserInfo;
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

		//$scope.changeSubscription = function(plan){
		// for(i=0;i<plan.allSubscriptionPlans.length;i++) {
		// 	if(plan.sliderValue <= plan.subscriptionMinAmount){
		// 		plan.subscriptionRate = 0;
		// 		plan.unitPrice =  parseFloat( plan.price ) ;
		// 		if(i===0)
		// 			plan.activeSubscriptions = parseInt(plan.allSubscriptionPlans[i].rangeTo);
		// 	}
		// 	if(plan.sliderValue >= parseInt(plan.allSubscriptionPlans[i].rangeFrom) && plan.sliderValue <= parseInt(plan.allSubscriptionPlans[i].rangeTo)){
		// 		plan.subscriptionRate = parseInt(plan.allSubscriptionPlans[i].rate);
		// 		plan.activeSubscriptions = parseInt(plan.allSubscriptionPlans[i].rangeTo);
		// 		plan.unitPrice = parseFloat(plan.allSubscriptionPlans[i].price);
		// 	}
		// }
		//$scope.accSubscriptionDetailsLoaded = true;
		//}

		$scope.setRating = function () {
			// console.log(this);
		}

		$scope.sliders = [{}];
		// $scope.$watch(function () {
		// 	if($scope.allPlans != null && $scope.companyPricePlans!= null && $scope.currentPlanName != null && !$scope.isSlidersLoaded) {
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
								$scope.companyPricePlans[i].unitPrice = $scope.companyPricePlans[i].allSubscriptionPlans[a].price;
								$scope.companyPricePlans[i].activeSubscriptions = $scope.companyPricePlans[i].allSubscriptionPlans[a].rangeTo ;
							});
						}
						//else if(value.targetScope.modelLabel == $scope.companyPricePlans[i].subscriptionMinAmount){
						//  $scope.$apply(function () {
						//    $scope.companyPricePlans[i].subscriptionRate = '0';
						//    $scope.companyPricePlans[i].unitPrice = $scope.companyPricePlans[i].price;
						//    $scope.companyPricePlans[i].activeSubscriptions = $scope.companyPricePlans[i].activeSubscriptions ;
						//  });
						//  // console.log($scope.companyPricePlans[i].subscriptionRate);
						//  // console.log($scope.companyPricePlans[i].unitPrice);
						//  // console.log($scope.companyPricePlans[i].activeSubscriptions);
						//}
					}
				}
			}

		});
		// / DYNAMIC PLANS


		// SUBSCRIPTION HISTORY PDF DOWNLOADER
		$scope.downloadSubscriptionPDF = function (record) {
      debugger;
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


		// Generic features
		$scope.packageFeatures = [
			{
				isActive: false,
				text:"Unlimited users",
				availableIn:['free_trial','starter','iambig']
			},{
				isActive: false,
				text:"Unlimited plans",
				availableIn:['free_trial','starter','iambig']
			},{
				isActive: false,
				text:"Unlimited subscriptions",
				availableIn:['starter','iambig']
			},{
				isActive: false,
				text:"Limited subscriptions (Only 25)",
				availableIn:['free_trial']
			}
		];

		$scope.updatePackgeFeatures = function (package_) {
			angular.forEach($scope.packageFeatures, function (pack) {
				pack.isActive = false;
				angular.forEach(pack.availableIn, function (pac) {
					if(pac == package_.code){
						pack.isActive = true;
					}
				});
			});
		}

		$scope.calculateCost = function (status, amount) {
			if(status == null){
				$scope.packageCost = parseInt(amount);
			}else{
				$scope.packageCost = parseInt($scope.tempSelectedPlan.unitPrice);
				angular.forEach($scope.planAddons, function (addon) {
					if (addon.isChecked) {
					//	$scope.selectedAddons.push(addon);
						// $scope.packageCost += parseInt(addon.unitPrice) * parseInt(addon.qty);
					}
				});
			}



			// var addonAmount = 0;
			// qty == 1 ? addonAmount = amount*qty : addonAmount = (amount*qty)-amount;
			// if(status){
			// 	$scope.packageCost += parseInt(addonAmount);
			// }else if(status == false){
			// 	$scope.packageCost -= parseInt(addonAmount);
			// }else{
			// 	$scope.packageCost = parseInt(amount);
			// }
		};

		$scope.showAddons = false;
		$scope.showAddonsContainer = function () {
			$scope.showAddons = !$scope.showAddons;
		}
	}
})();

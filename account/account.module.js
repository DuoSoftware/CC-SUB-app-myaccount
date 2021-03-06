////////////////////////////////
// App : MyAccount / MyProfile
// Owner : Ishara Gunathilaka
// Last changed date : 2018/06/19
// Version : 6.1.0.34
// Modified By : Kasun
/////////////////////////////////


(function ()
{
	'use strict';

	angular
		.module('app.myaccount',[])
		.config(config);

	/** @ngInject */
	function config($stateProvider, $translatePartialLoaderProvider, msApiProvider, msNavigationServiceProvider)
	{

		$stateProvider
			.state('app.myaccount', {
				url    : '/myaccount',
				views  : {
					'myaccount@app': {
						templateUrl: 'app/main/account/account.html',
						controller : 'AccountController as vm'
					}
				},
				resolve: {
					security: ['$q','mesentitlement','$timeout','$location', function($q,mesentitlement,$timeout, $location){
						return $q(function(resolve, reject) {
							$timeout(function() {
								resolve(function () {
									var entitledStatesReturn = mesentitlement.stateDepResolver('myaccount');

									mesentitlementProvider.setStateCheck("myaccount");
								});
							});
						});
					}]

				},
				bodyClass: 'myaccount'
			});

		msNavigationServiceProvider.saveItem('myaccount', {
			// title    : 'My Account',
			state    : 'app.myaccount',
			/*stateParams: {
			 'param1': 'page'
			 },*/
			weight   : 1
		});
	}
})();

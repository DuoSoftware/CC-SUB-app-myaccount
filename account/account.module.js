////////////////////////////////
// App : MyAccount / MyProfile
// Owner : Ishara Gunathilaka
// Last changed date : 2017/11/25
// Version : 6.1.0.33
// Modified By : Ishara
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
				url    : '/account',
				views  : {
					'account@app': {
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
				bodyClass: 'account'
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

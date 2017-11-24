////////////////////////////////
// App : MyAccount / MyProfile
// Owner : Ishara Gunathilaka
// Last changed date : 2017/11/24
// Version : 6.1.0.32
// Modified By : Kasun
/////////////////////////////////


(function ()
{
	'use strict';

	angular
		.module('app.account',[])
		.config(config);

	/** @ngInject */
	function config($stateProvider, $translatePartialLoaderProvider, msApiProvider, msNavigationServiceProvider)
	{

		$stateProvider
			.state('app.account', {
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
									var entitledStatesReturn = mesentitlement.stateDepResolver('account');

									mesentitlementProvider.setStateCheck("account");
								});
							});
						});
					}]

				},
				bodyClass: 'account'
			});

		msNavigationServiceProvider.saveItem('account', {
			// title    : 'My Account',
			state    : 'app.account',
			/*stateParams: {
			 'param1': 'page'
			 },*/
			weight   : 1
		});
	}
})();

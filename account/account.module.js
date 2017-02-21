////////////////////////////////
// App : MyAccount / MyProfile
// Owner : Ishara Gunathilaka
// Last changed date : 2017/01/11
// Version : 6.0.0.1
// Modified By : ishara
/////////////////////////////////


(function ()
{
  'use strict';

  angular
    .module('app.account',['stripe-payment-tools'])
    .config(config);

  /** @ngInject */
  function config($stateProvider, $translatePartialLoaderProvider, msApiProvider, msNavigationServiceProvider)
  {

    // State
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

        },
        bodyClass: 'account'
      });

    msNavigationServiceProvider.saveItem('account', {
      title    : 'My Account',
      state    : 'app.account',
      /*stateParams: {
       'param1': 'page'
       },*/
      weight   : 1
    });
  }
})();

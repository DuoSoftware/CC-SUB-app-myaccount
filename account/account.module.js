////////////////////////////////
// App : MyAccount / MyProfile
// Owner : Ishara Gunathilaka
// Last changed date : 2017/08/24
// Version : 6.1.0.22
// Modified By : Kasun
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
    /** Check for Super admin */
    var isSuperAdmin = gst('isSuperAdmin');
    /** Check for Super admin - END */

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
                if (isSuperAdmin != 'true') {
                  resolve(function () {
                    var entitledStatesReturn = mesentitlement.stateDepResolver('account');

                    mesentitlementProvider.setStateCheck("account");
                  });
                }
              });
            });
          }]

        },
        bodyClass: 'account'
      });

    if(isSuperAdmin != 'true'){
      msNavigationServiceProvider.saveItem('account', {
         // title    : 'My Account',
        state    : 'app.account',
        /*stateParams: {
         'param1': 'page'
         },*/
        weight   : 1
      });
    }
  }

      
})();

(function ()
{
    'use strict';

    angular
        .module('app.account')
        .controller('AccountDialogController', AccountDialogController);

    /** @ngInject */
    function AccountDialogController($mdDialog, selectedPlanDetails, $scope)
    {
        var vm = this;

        vm.hiddenCC = true;
        vm.hiddenBCC = true;

        // If replying
        if ( angular.isDefined(selectedPlanDetails) )
        {
          $scope.selectedPlan = selectedPlanDetails;
        }

        // Methods
        vm.closeDialog = closeDialog;

        //////////

        function closeDialog()
        {
            $mdDialog.hide();
        }
    }
})();

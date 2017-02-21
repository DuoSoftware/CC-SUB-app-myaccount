<?php

require_once($_SERVER["DOCUMENT_ROOT"] . '/azureshell/app/main/account/paymentMethod/CloudChargeEndpointLibrary/cloudcharge.php');

$doc = $_SERVER ['DOCUMENT_ROOT'];
define('DOC_ROOT', $doc);
require_once ($doc.'/services/config/settings.php');

                  echo '  <!DOCTYPE html>  <html>  <head> <style> ';
                          /* Center the loader */
                   echo '       #loader { '.
                           ' position: absolute;'.
                           ' left: 50%;'.
                            'top: 50%;'.
                        '    z-index: 1;'.
                        '    width: 150px;'.
                        '    height: 150px;'.
                        '    margin: -75px 0 0 -75px;'.
                        '    border: 16px solid #f3f3f3;'.
                        '    border-radius: 50%;'.
                        '   border-top: 16px solid #3498db;'.
                        '    width: 120px;'.
                        '    height: 120px;'.
                        '    -webkit-animation: spin 2s linear infinite;'.
                        '   animation: spin 2s linear infinite;'.
                        '  }';

                        echo '  @-webkit-keyframes spin { 0% { -webkit-transform: rotate(0deg); } 100% { -webkit-transform: rotate(360deg); } }';

                        echo '  @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } } ';

                          /* Add animation to "page content" */
                        echo '  .animate-bottom {   position: relative;  -webkit-animation-name: animatebottom;  -webkit-animation-duration: 1s; animation-name: animatebottom;';
                         echo '   animation-duration: 1s   }';

                    echo ' @-webkit-keyframes animatebottom {  from { bottom:-100px; opacity:0 }  to { bottom:0px; opacity:1 } }';

                    echo ' @keyframes animatebottom {  from{ bottom:-100px; opacity:0 } to{ bottom:0; opacity:1 } } ';

                     echo ' #myDiv { display: none; text-align: center; }';
                     echo '  </style>  </head>  <body style="margin:0;">  <div id="loader"></div> </body> </html> ';



if(!isset($_COOKIE['planId'])) {
    print_r('inside if');
   // header('Location: ../../../../#/account');
 }else{

    $planId = $_COOKIE['planId'];
    $st = $_COOKIE['securityToken'];
    $price = $_COOKIE['price'];
    $name = $_COOKIE['name'];
    $tenantID = $_COOKIE['tenantID'];
    $selectedPlan = $_COOKIE['selectedPlan'];

    $paymentStatus = "";

    if(isset($_COOKIE['paymentStatus']))
      $paymentStatus = $_COOKIE['paymentStatus'];


//      print_r($planId.' '.$st. ' '.$price.' '.$name.' '.$tenantID.' '.$selectedPlan.' '.$paymentStatus);
//      exit();

    $resp = new stdClass();
    $resp->status = 0;

    $planInfo = new stdClass();
    $planInfo->plan = $planId;
    $planInfo->quantity = 1;
    $planInfo->amount = $price;

    if($paymentStatus == 'canceled')
    {

        $planInfo->panelty = 0;

        $resp = (new CloudCharge())->plan()->upgradeToFixedplan($planInfo);
    }
    else{

  if($selectedPlan == 'free_trial' || $selectedPlan == 'personal_space' ){

    $token  = $_COOKIE['stripeToken'];//$_POST['stripeToken'];


//        $actual_link = "http://$_SERVER[HTTP_HOST]";
//        print_r($actual_link);
//        print_r($_COOKIE);
//        print_r($token);
//        exit();

       $planInfo->token = $token;

      $resp = (new CloudCharge())->plan()->subscribeToFixedplan($token ,$planInfo);

    }else{
         $resp = (new CloudCharge())->plan()->upgradeToFixedplan($planInfo);

    }
}

//print_r($resp);
//       exit();


    if($resp->status)
        {
           // header('Location: ../#/proceed?plan='.$planId.'&st='.$st.'&tenantID='.$tenantID);


         // $authData = $_COOKIE['authData'];

           $ch = curl_init();

           $head = array();
             $head[] = 'Content-Type: application/json';
             $head[] = 'id_token: '.$st;

           curl_setopt($ch, CURLOPT_HTTPHEADER,$head);

           //curl_setopt($ch, CURLOPT_URL, "". MAIN_DOMAIN ."/apis/authorization/priceplan/update/".json_decode($authData)->Username."/".$planId);
           curl_setopt($ch, CURLOPT_URL, "http://dev.cloudcharge.com:8001/auth/updateSubscription?planCode=".$planId);

           // receive server response ...
           curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);

           $output = curl_exec ($ch);

           curl_close ($ch);


////           Permission Update
//
//                $chp = curl_init();
//
//                    $headr = array();
//                    $headr[] = 'Content-Type: application/json';
//                    $headr[] = 'idToken: '.$st;
//
//                      curl_setopt($chp, CURLOPT_HTTPHEADER,$headr);
//
//					            curl_setopt($chp, CURLOPT_COOKIE, "id_token=" . $st );
//
//                      $planId = str_replace("_year","",$planId);
//
//                     curl_setopt($chp, CURLOPT_URL, "". MAIN_DOMAIN ."/services/duosoftware.cloudChargeAPI/cloudChargeAPI/switchPlan?plan=".$planId);
//
//					// $urlss = "http://". MAIN_DOMAIN ."/services/duosoftware.cloudChargeAPI/cloudChargeAPI/switchPlan?plan=".$planId;
//
//                      // receive server response ...
//                      curl_setopt($chp, CURLOPT_RETURNTRANSFER, 1);
//
//                      $outputp = curl_exec ($chp);
//
//                      curl_close ($chp);


          $message = "You have successfully Updated to ".$name." Package. Please re login to active new features.";
                     echo "<html><head></head><body><script type='text/javascript'>alert('".$message."'); window.location = '../../../../#/account';</script></body></html>";

        }
        else
        {
           $message = "Error while make payment, ".$resp->result.",  Please choose again to update new package.";
           echo "<html><head></head><body><script type='text/javascript'>alert('".$message."'); window.location = '../../../../#/account' </script></body></html>";


        }

}

?>

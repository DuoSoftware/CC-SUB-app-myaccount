<?php

require_once($_SERVER["DOCUMENT_ROOT"] . '/azureshell/app/main/account/paymentMethod/CloudChargeEndpointLibrary/cloudcharge.php');

$doc = $_SERVER ['DOCUMENT_ROOT'];
define('DOC_ROOT', $doc);
require_once ($doc.'/services/config/settings.php');
require_once('../data/accountConfig.php');

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
    header('Location: ../../../../#/account');
 }else{

    $planId = $_COOKIE['planId'];
    $st = $_COOKIE['securityToken'];
    $price = $_COOKIE['price'];
    $name = $_COOKIE['name'];
    $tenantID = $_COOKIE['tenantID'];
    $selectedPlan = $_COOKIE['selectedPlan'];
    $subscriptionAmount = $_COOKIE['subscriptionAmount'];
    $additionalUserQty = $_COOKIE['additionalUserQty'];
    $additionalUserTotalPrice = $_COOKIE['additionalUserTotalPrice'];

    $paymentStatus = "";

    if(isset($_COOKIE['paymentStatus']))
      $paymentStatus = $_COOKIE['paymentStatus'];


//      print_r($planId.' '.$st. ' '.$price.' '.$name.' '.$tenantID.' '.$selectedPlan.' '.$paymentStatus);
//      exit();

    $resp = new stdClass();
    $resp->status = 0;

//"attributes": [
//					{"tag":"storage","feature": "25GB storage","quantity":0,"amount": 30,"action":"remove"},
//					{"tag":"user","feature": "Additional users","amount": 15,"quantity":5,"action":"add"}
//				],
//				"subscription": "month",
//				"quantity":	1
//			}

    $planInfo = new stdClass();
    $planInfo->plan = $planId;
    $planInfo->quantity = 1;
    $planInfo->amount = $price;
    $planInfo->subscription = "month";

    if(strpos($planId,'_year')){
      $planInfo->subscription = "year";
    }

      $planInfo->attributes[0] = new stdClass();
      $planInfo->attributes[0]->tag = "Package";
      $planInfo->attributes[0]->feature = $name;
      $planInfo->attributes[0]->amount = $price;
      $planInfo->attributes[0]->quantity = 1;
      $planInfo->attributes[0]->action = "add";


    if($paymentStatus == 'canceled')
    {

        $planInfo->panelty = 0;

        $resp = (new CloudCharge())->plan()->upgradeToFixedplan($planInfo);
    }
    else{

  if($selectedPlan == 'free_trial' || $selectedPlan == 'personal_space' ){

    $token  = $_COOKIE['stripeToken'];//$_POST['stripeToken'];


       $planInfo->token = $token;

      //$resp = (new CloudCharge())->plan()->subscribeToFixedplan($token ,$planInfo); // commented on 3/22 because all plans saving as custormized plan
      $resp = (new CloudCharge())->plan()->subscribeToCustomplan($token ,$planInfo);

    }else{

        $planInfo->plan = 'custom';

              $planInfo->attributes[1] = new stdClass();
             $planInfo->attributes[1]->tag = "user";
             $planInfo->attributes[1]->feature = "Additional users";
             $planInfo->attributes[1]->amount = $additionalUserTotalPrice;
             $planInfo->attributes[1]->quantity = $additionalUserQty;  // full amount
             $planInfo->attributes[1]->action = "add";

        $resp = (new CloudCharge())->plan()->upgradeToCustomplan($planInfo);
        // $resp = (new CloudCharge())->plan()->upgradeToFixedplan($planInfo); // commented on 3/22 because all plans saving as custormized plan

    }
}
print_r($resp);
exit();
    if($resp->status)
        {

           $ch = curl_init();

           $head = array();
             $head[] = 'Content-Type: application/json';
             $head[] = 'id_token: '.$st;

           curl_setopt($ch, CURLOPT_HTTPHEADER,$head);

           $planId = str_replace("_year","",$planId);

           //curl_setopt($ch, CURLOPT_URL, "". MAIN_DOMAIN ."/apis/authorization/priceplan/update/".json_decode($authData)->Username."/".$planId);
           curl_setopt($ch, CURLOPT_URL, "http://".host.":8001/auth/updateSubscription?planCode=".$planId);
           //curl_setopt($ch, CURLOPT_URL, "http://app.cloudcharge.com:8001/auth/updateSubscription?planCode=".$planId);

           // receive server response ...
           curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);

           $output = curl_exec ($ch);

           curl_close ($ch);

//           Permission Update

                $chp = curl_init();

                    $headr = array();
                    $headr[] = 'Content-Type: application/json';
                    $headr[] = 'idToken: '.$st;

                      curl_setopt($chp, CURLOPT_HTTPHEADER,$headr);

					            curl_setopt($chp, CURLOPT_COOKIE, "idToken=" . $st );

                      $planId = str_replace("_year","",$planId);

                     curl_setopt($chp, CURLOPT_URL, "http://".host."/services/duosoftware.cloudChargeAPI/cloudChargeAPI/switchPlan?plan=".$planId);
                     //curl_setopt($chp, CURLOPT_URL, "http://app.cloudcharge.com/services/duosoftware.cloudChargeAPI/cloudChargeAPI/switchPlan?plan=".$planId);
                     //curl_setopt($chp, CURLOPT_URL, "". MAIN_DOMAIN ."/services/duosoftware.cloudChargeAPI/cloudChargeAPI/switchPlan?plan=".$planId);

					     // receive server response ...
                      curl_setopt($chp, CURLOPT_RETURNTRANSFER, 1);

                      $outputp = curl_exec ($chp);

                      curl_close ($chp);


//           Subscription Update

                $cho = curl_init();

                    $headr = array();
                    $headr[] = 'Content-Type: application/json';
                    $headr[] = 'idToken: '.$st;

                    $data = array("appId"=> "invoice",
                                              "amount"=> $subscriptionAmount,
                                              "expiry"=> "",
                                              "sign"=> "<=");
                    $data_string = json_encode($data);

//                    $meta = array("domainUrl" => 'app.cloudcharge.com',
//                                              "idToken"=> $st);
//                    $meta_string = json_encode($meta);

                      curl_setopt($cho, CURLOPT_HTTPHEADER,$headr);

                      curl_setopt($cho, CURLOPT_POST, 1);
                      curl_setopt($cho, CURLOPT_POSTFIELDS,$data_string);

					            curl_setopt($cho, CURLOPT_COOKIE, "idToken=" . $st );

                     curl_setopt($cho, CURLOPT_URL, "http://".host."/services/duosoftware.ratingEngine/ratingEngine/createRule");
                     //curl_setopt($cho, CURLOPT_URL, "http://app.cloudcharge.com/services/duosoftware.ratingEngine/ratingEngine/createRule");
                     //curl_setopt($cho, CURLOPT_URL, "". MAIN_DOMAIN ."/services/duosoftware.ratingEngine/ratingEngine/createRule");

                      curl_setopt($cho, CURLOPT_RETURNTRANSFER, 1);

                      $outputo = curl_exec ($cho);

                      curl_close ($cho);



              header('Location: ../../../../#/account');

        }
        else
        {
           //print_r("Error : ".$resp);

           $message = "Error while make payment, ".$resp->response.",  Please choose again to update new package.";
           echo "<html><head></head><body><script type='text/javascript'>alert('".$message."'); window.location = '../../../../#/account' </script></body></html>";
        }

}

?>

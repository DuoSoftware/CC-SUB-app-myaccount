<?php

$postString = file_get_contents ( 'php://input' );
$input = json_decode ( $postString, TRUE );

require_once('../data/accountConfig.php');
require_once($_SERVER["DOCUMENT_ROOT"] . '/azureshell/app/main/account/paymentMethod/CloudChargeEndpointLibrary/cloudcharge.php');

$doc = $_SERVER ['DOCUMENT_ROOT'];
define('DOC_ROOT', $doc);
require_once ($doc.'/services/config/settings.php');


if(!isset($input['plan'])) {
    print_r('{"status":"error"}');

 }else{

    $planId = $input['plan'];
    $st = $_COOKIE['securityToken'];
    $price = $input['price'];
    $name = $input['name'];
    $tenantID = $input['tenantID'];
    $selectedPlan = $input['selectedPlan'];
    $subscriptionAmount = $input['subscriptionAmount'];
    $additionalUserQty = $input['additionalUserQty'];
    $additionalUserTotalPrice = $input['additionalUserTotalPrice'];
    $domain = $_COOKIE['domain'];

    $paymentStatus = "";

    if(isset($input['paymentStatus']))
      $paymentStatus = $input['paymentStatus'];


//      print_r($planId.' '.$st. ' '.$price.' '.$name.' '.$tenantID.' '.$selectedPlan.' '.$paymentStatus);
//      print_r($domain);
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

    $token  = $input['stripeToken'];//$_POST['stripeToken'];


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

    if($resp->status)
        {

           $ch = curl_init();

           $head = array();
             $head[] = 'Content-Type: application/json';
             $head[] = 'id_token: '.$st;
             $head[] = 'domain: '.$domain;

           curl_setopt($ch, CURLOPT_HTTPHEADER,$head);

           $planId = str_replace("_year","",$planId);

           //curl_setopt($ch, CURLOPT_URL, "". MAIN_DOMAIN ."/apis/authorization/priceplan/update/".json_decode($authData)->Username."/".$planId);
           curl_setopt($ch, CURLOPT_URL, "https://".host."/services/apis.php/auth/updateSubscription?planCode=".$planId);
           //curl_setopt($ch, CURLOPT_URL, "http://app.cloudcharge.com:8001/auth/updateSubscription?planCode=".$planId);

			curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
           // receive server response ...
           curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);

           $output = curl_exec ($ch);

           curl_close ($ch);

//           Permission Update

                $chp = curl_init();

                    $headr = array();
                    $headr[] = 'Content-Type: application/json';
                    $headr[] = 'idToken: '.$st;
                    $head[] = 'domain: '.$domain;

                      curl_setopt($chp, CURLOPT_HTTPHEADER,$headr);

					            curl_setopt($chp, CURLOPT_COOKIE, "idToken=" . $st );

                      $planId = str_replace("_year","",$planId);

                     curl_setopt($chp, CURLOPT_URL, "https://".host."/services/duosoftware.cloudChargeAPI/cloudChargeAPI/switchPlan?plan=".$planId);
                     //curl_setopt($chp, CURLOPT_URL, "http://app.cloudcharge.com/services/duosoftware.cloudChargeAPI/cloudChargeAPI/switchPlan?plan=".$planId);
                     //curl_setopt($chp, CURLOPT_URL, "". MAIN_DOMAIN ."/services/duosoftware.cloudChargeAPI/cloudChargeAPI/switchPlan?plan=".$planId);

					 curl_setopt($chp, CURLOPT_SSL_VERIFYPEER, false);
					     // receive server response ...
                      curl_setopt($chp, CURLOPT_RETURNTRANSFER, 1);

                      $outputp = curl_exec ($chp);

                      curl_close ($chp);


//           Subscription Update
//  		Sudha asked to remove update rule on 04/09/2017

               /* $cho = curl_init();

                    $headr = array();
                    $headr[] = 'Content-Type: application/json';
                    $headr[] = 'idToken: '.$st;
                    $head[] = 'domain: '.$domain;

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

					  curl_setopt($cho, CURLOPT_SSL_VERIFYPEER, false);

					  curl_setopt($cho, CURLOPT_COOKIE, "idToken=" . $st );

                     curl_setopt($cho, CURLOPT_URL, "https://".host."/services/duosoftware.ratingEngine/ratingEngine/createRule");
                     //curl_setopt($cho, CURLOPT_URL, "http://app.cloudcharge.com/services/duosoftware.ratingEngine/ratingEngine/createRule");
                     //curl_setopt($cho, CURLOPT_URL, "". MAIN_DOMAIN ."/services/duosoftware.ratingEngine/ratingEngine/createRule");

                      curl_setopt($cho, CURLOPT_RETURNTRANSFER, 1);

                      $outputo = curl_exec ($cho);

                      curl_close ($cho);
					*/


			 print_r('{"status":"success"}');
              //header('Location: ../../../../#/account');

        }
        else
        {
            $message = '{"status":"error","message":"Error while make payment, '.$resp->response.',  Please choose again to update new package."}';
                   print_r( $message);

           //echo "<html><head></head><body><script type='text/javascript'>alert('".$message."'); window.location = '../../../../#/account' </script></body></html>";
        }

}

?>

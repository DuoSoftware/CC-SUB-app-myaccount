<?php

require_once('../data/accountConfig.php');
require_once($_SERVER["DOCUMENT_ROOT"] . '/azureshell/app/main/account/paymentMethod/CloudChargeEndpointLibrary/cloudcharge.php');


$doc = $_SERVER ['DOCUMENT_ROOT'];
require_once ($doc.'/services/config/settings.php');

$view = "";
if (isset ( $_GET ["view"] ))
	$view = $_GET ["view"];

switch ($view) {

  // GET
    case "updatePackageWithAddAdditionalUsers" :
      $userCount = $_GET ["userCount"];
      $userPrice = $_GET ["userPrice"];

      $planId = $_GET['plan'];
          $st = $_COOKIE['securityToken'];  // get from cookie
          $price = $_GET['price'];
          $name = $_GET['name'];
          $tenantID = $_GET['tenantID'];
          $selectedPlan = $_GET['selectedPlan'];
          $paymentStatus = $_GET['paymentStatus'];
          $domain = $_GET['domain'];

//{
//				"attributes": [
//					{"tag":"storage","feature": "25GB storage","quantity":0,"amount": 30,"action":"remove"},
//					{"tag":"user","feature": "Additional users","amount": 15,"quantity":5,"action":"add"}
//				],
//				"subscription": "month",
//				"quantity":	1
//			}
                    $subscription = "month";
                  if (strpos($planId, 'year') !== false) {
                     $subscription = "year";;
                  }

                  $planInfo = new stdClass();
                  $planInfo->plan = "custom";
                  $planInfo->quantity = "1";
                  $planInfo->subscription = $subscription;
                  $planInfo->quantity = "1";
                  $planInfo->pacakgeAmount = $price + $userPrice;  // total amount
                  $planInfo->attributes[0] = new stdClass();
                  $planInfo->attributes[0]->tag = "Package";
                  $planInfo->attributes[0]->feature = $planId;
                  $planInfo->attributes[0]->amount = $price;  // plan price
                  $planInfo->attributes[0]->action = "add";


                  $planInfo->attributes[1] = new stdClass();
                   $planInfo->attributes[1]->tag = "user";
                   $planInfo->attributes[1]->feature = "Additional users";
                   $planInfo->attributes[1]->amount = $userPrice;
                   $planInfo->attributes[1]->quantity = $userCount;
                   $planInfo->attributes[1]->action = "add";

      $rawData = (new CloudCharge())->plan()->upgradeToCustomplan($planInfo);

      if($rawData->status){


                 // $authData = $_COOKIE['authData'];

                   $ch = curl_init();

                   $head = array();
                       $head[] = 'Content-Type: application/json';
                       $head[] = 'id_token: '.$st;
                       $head[] = 'domain: '.$domain;

                       curl_setopt($ch, CURLOPT_HTTPHEADER,$head);

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

                             curl_setopt($chp, CURLOPT_URL, "". MAIN_DOMAIN ."/services/duosoftware.cloudChargeAPI/cloudChargeAPI/switchPlan?plan=".$planId);

        					// $urlss = "http://". host ."/services/duosoftware.cloudChargeAPI/cloudChargeAPI/switchPlan?plan=".$planId;

                              // receive server response ...
                              curl_setopt($chp, CURLOPT_RETURNTRANSFER, 1);

                              $outputp = curl_exec ($chp);

                              curl_close ($chp);


      }

      echo json_encode($rawData);

      break;

	// GET
	case "addAdditionalUsers" :
		$userCount = $_GET ["userCount"];
		$userPrice = $_GET ["userPrice"];

//		{
//    			"features": [
//    				{"tag":"storage","feature": "25GB storage","quantity":0,"amount": 30,"action":"remove"},
//    				{"tag":"user","feature": "Additional users","amount": 15,"quantity":5,"action":"add"}
//    			]
//    		}
//
		            $planInfo = new stdClass();
        		    $planInfo->features[0] = new stdClass();
                $planInfo->features[0]->tag = "user";
                $planInfo->features[0]->feature = "Additional users";
                $planInfo->features[0]->amount = $userPrice;
                $planInfo->features[0]->quantity = $userCount;
                $planInfo->features[0]->action = "add";

	  $rawData = (new CloudCharge())->plan()->customize($planInfo);
	  echo json_encode($rawData);

		break;

		case "getCardDetails" :
	  $rawData = (new CloudCharge())->card()->getInfo();
	  echo json_encode($rawData);

		break;

		case "setCardDefault" :
		$cardId = $_GET ["cardId"];
	  $rawData = (new CloudCharge())->card()->setAsDefault($cardId);;
	  echo json_encode($rawData);

		break;


	case "" :
		header ( 'HTTP/1.1 404 Not Found' );
		break;
}


?>

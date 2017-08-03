<?php

require_once('../data/accountConfig.php');
require_once($_SERVER["DOCUMENT_ROOT"] . '/azureshell/app/main/account/paymentMethod/CloudChargeEndpointLibrary/cloudcharge.php');


$view = "";
if (isset ( $_GET ["view"] ))
	$view = $_GET ["view"];

switch ($view) {

//(new CloudCharge())->card()->add($token [,$default]); // invoke to create a new card.
//	(new CloudCharge())->card()->getInfo(); // invoke to retrive card details of user. this will return all cards infomations that user has entered.
//	(new CloudCharge())->card()->remove($cardId); //invoke to remove a card.
//	(new CloudCharge())->card()->setAsDefault($cardId); invoke to set a card as default.

	// GET
	case "addCard" :
		$token = $_GET ["token"];
		$default = $_GET ["default"];
	  $rawData = (new CloudCharge())->card()->add($token ,$default);
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

		case "removeCard" :
        $cardId = $_GET ["cardId"];
      $rawData = (new CloudCharge())->card()->remove($cardId);;
      echo json_encode($rawData);

        break;


	case "" :
		header ( 'HTTP/1.1 404 Not Found' );
		break;
}


?>

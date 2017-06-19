<?php

/*

	CloudCharge Endpoint Library
		Version 1.0.7

	change-log [
		2016-10-05 - added subscription check method for plans.
		2016-9-26 - introduce new methods to handle plan upgrade related operations.
		2016-9-08 - introduce new methods to handle plan related operations.
		2016-9-02 - introduce new methods to handle card related operations.
		2016-9-02 - format method responses.
		2016-8-29 - added new method to get apps within the subscription period.
		2016-8-23 - added token authentication for card.
		2016-8-23 - added method for get registered stripe customer information.
	]
*/


ini_set('display_errors', 0);
ini_set('display_startup_errors', 0);
error_reporting(E_ALL);

require_once($_SERVER['DOCUMENT_ROOT'] ."/azuredwcommon.php");
require_once($_SERVER['DOCUMENT_ROOT'] ."/include/azureconfig.php");

class AppStruct {
	public $uom;
	public $code;
	public $product_name;
	public $category;
	public $price_of_unit;
	public $status;
	public $type;
	public $subscriptionDetails;
}

class SubscriptionStruct {
	public $interval; // month, year
	public $currency;
}

class PaymentStuct {
	public $customer;
	public $token;
	public $amount;
	public $appkey;
	public $type;
}

class CardStruct {
	public $token;
	public $default;
}

class FixedPlanStruct {
	public $token;
	public $plan;
	public $quantity;
	public $amount;
}

class CustomPlanStruct {
	public $customer;
	public $token;
	public $quantity;
	public $planDetails;
	public $pacakgeAmount;
	public $interval;
}

Class Card {

	private $cClient;

	public function add($token, $default = false) {
		if($token) {
			$card = new CardStruct();
			$card->token = $token;
			$card->default = (is_bool($default)) ? $default : false;

			$res = $this->cClient->getRequestInvoker()->post("/cardAdd", $card);
			return $this->getDefaultValue($res);
		}

	}

	public function getInfo() {
		$res = $this->cClient->getRequestInvoker()->get("/cardInfo");
		return $this->getDefaultValue($res);

	}

	public function remove($cardId) {
		if($cardId) {
			$card = new stdClass();
			$card->card_id = $cardId;

			$res = $this->cClient->getRequestInvoker()->post("/cardDelete", $card);
			return $this->getDefaultValue($res);
		}

	}

	public function setAsDefault($cardId) {
		if($cardId) {
			$card = new stdClass();
			$card->card_id = $cardId;

			$res = $this->cClient->getRequestInvoker()->post("/makeDefault", $card);
			return $this->getDefaultValue($res);
		}

	}

	private function getDefaultValue($res){
		$jsonObj = json_decode($res);
		if (!$jsonObj){
			$jsonObj = new stdClass();
			$jsonObj->status = false;
			$jsonObj->response = $res;
		}
		return $jsonObj;

	}

	function __construct($cClient) {
		$this->cClient = $cClient;
	}

}

class User {

	private $cClient;

	public function get() {

		$res = $this->cClient->getRequestInvoker()->get("/getStripeCustomer");
		return $this->getDefaultValue($res);

	}

	private function getDefaultValue($res){
		$jsonObj =json_decode($res);
		if (!$jsonObj){
			$jsonObj = new stdClass();
			$jsonObj->status = false;
			$jsonObj->response = $res;
		}
		return $jsonObj;

	}

	function __construct($cClient) {
		$this->cClient = $cClient;
	}

}

class App {

	private $cClient;

	public function create($appInfo) {

		$app = new AppStruct();

		if(isset($appInfo->paymentMethod)) {
			$appInfo->paymentMethod = strtolower($appInfo->paymentMethod);
			switch ($appInfo->paymentMethod) {

				case 'onetime':

					$app->uom = "UNITS";
					$app->type = "onetime";
					$app->subscriptionDetails = array();
					break;

				case 'subscription':

					$app->type = "subscription";

					if(isset($appInfo->subscriptionInfo)) {
						$app->uom = $appInfo->subscriptionInfo->subscriptionPeriod;

						$subscription = new SubscriptionStruct();

						$subscription->interval = $appInfo->subscriptionInfo->subscriptionPeriod;
						$subscription->currency = (isset($appInfo->subscriptionInfo->currency))
													? strtolower($appInfo->subscriptionInfo->currency) : "usd";

						$app->subscriptionDetails = array($subscription);
					}
					break;

			}
		}

		$app->code = $appInfo->appKey;
		$app->product_name = $appInfo->appName;
		$app->category = $appInfo->appCategory;
		$app->price_of_unit = $appInfo->unitPrice;
		$app->status = true;

		$res = $this->cClient->getRequestInvoker()->post("/registerPlan", $app);
		return $this->getDefaultValue($res);

	}

	public function purchase($appkey, $price, $token = "") {

		$pay = new PaymentStuct();

		if(empty($token)) {
			$pay->customer = "exist";
			$pay->token = "";
		}else {
			$pay->customer = "new";
			$pay->token = $token;
		}

		$pay->appkey = $appkey;
		$pay->amount = $price;
		$pay->type = "onetime";

		$res = $this->cClient->getRequestInvoker()->post("/purchaseApp", $pay);
		return $this->getDefaultValue($res);

	}

	public function subscribe($appkey, $token = "") {

		$pay = new PaymentStuct();

		if(empty($token)) {
			$pay->customer = "exist";
			$pay->token = "";
		}else {
			$pay->customer = "new";
			$pay->token = $token;
		}

		$pay->appkey = $appkey;
		$pay->type = "subscription";

		unset($pay->amount);

		$res = $this->cClient->getRequestInvoker()->post("/purchaseApp", $pay);
		return $this->getDefaultValue($res);

	}

	public function withinSubscriptionPeriod() {

		$res = $this->cClient->getRequestInvoker()->get("/getActiveApps");
		return $this->getDefaultValue($res);

	}

	public function reinstall($appkey) {

		if($appKey === "")
			return;

		$res = $this->cClient->getRequestInvoker()->post("/reinstall", json_decode('{"appKey":"'. $appkey .'"}'));
		return $this->getDefaultValue($res);

	}

	public function uninstall($appkey) {

		if($appKey === "")
			return;

		$res = $this->cClient->getRequestInvoker()->post("/uninstallApp", $pay);
		return $this->getDefaultValue($res);

	}

	private function getDefaultValue($res){

		$jsonObj =json_decode($res);
		if (!$jsonObj){
			$jsonObj = new stdClass();
			$jsonObj->status = false;
			$jsonObj->response = $res;
		}
		return $jsonObj;

	}

	function __construct($cClient) {
		$this->cClient = $cClient;
	}

}

class Plan {

	private $cClient;

	public function subscribeToFixedplan($token ,$planInfo) {
		/* {"plan":"Gold", "amount": 10, "quantity":1} */
		$plan = new FixedPlanStruct();
		$plan->token = $token;
		$plan->plan = $planInfo->plan;
		$plan->amount = (float)$planInfo->amount;
		$plan->quantity = (isset($planInfo->quantity)) ? (int)$planInfo->quantity : 1;

		$res = $this->cClient->getRequestInvoker()->post("/fixedPackage", $plan);
		return $this->getDefaultValue($res);

	}

	public function subscribeToCustomplan($token ,$planInfo) {
		/*
			{
				"attributes": [
					{"tag":"storage","feature": "25GB storage","quantity":0,"amount": 30,"action":"remove"},
					{"tag":"user","feature": "Additional users","amount": 15,"quantity":5,"action":"add"}
				],
				"subscription": "month",
				"quantity":	1
			}
		*/

		$plan = new CustomPlanStruct();
		$plan->customer = "new";
		$plan->token = $token;

		$totamount = 0.0;
		foreach ($planInfo->attributes as $attribute) {
			if($attribute->action === "add")
				$totamount += (float)$attribute->amount;
		}

		$plan->pacakgeAmount = $totamount;
		$plan->planDetails = $planInfo->attributes;
		$plan->interval = $planInfo->subscription;
		$plan->quantity = (isset($planInfo->quantity)) ? (int)$planInfo->quantity : 1;

		$res = $this->cClient->getRequestInvoker()->post("/customPackage", $plan);
		return $this->getDefaultValue($res);

	}

	public function customize($planInfo) {

		/*
			{
				"features": [
					{"tag":"storage","feature": "25GB storage","quantity":0,"amount": 30,"action":"remove"},
					{"tag":"user","feature": "Additional users","amount": 15,"quantity":5,"action":"add"}
				]
			}
		*/

		$totamount = 0.0;

		$plan = new CustomPlanStruct();
		$plan->customer = "exist";

		foreach ($planInfo->features as $feature) {
			if($feature->action === "add")
				$totamount += (float)$feature->amount;
		}

		$plan->planDetails = $planInfo->features;
		$plan->pacakgeAmount = $totamount;
		$plan->quantity = 1;
		unset($plan->interval);
		unset($plan->token);

		$res = $this->cClient->getRequestInvoker()->post("/customPackage", $plan);
		return $this->getDefaultValue($res);

	}

	public function upgradeToFixedplan($planInfo) {
		/* {"plan":"Gold", "amount": 10, "quantity":1} */

		$plan = new FixedPlanStruct();
		$plan->plan = $planInfo->plan;
		$plan->amount = (float)$planInfo->amount;
		$plan->quantity = (isset($planInfo->quantity)) ? (int)$planInfo->quantity : 1;
		unset($plan->token);

		$res = $this->cClient->getRequestInvoker()->post("/upgrade", $plan);
		return $this->getDefaultValue($res);

	}

	public function upgradeToCustomplan($planInfo) {

		/*
			{
				"attributes": [
					{"tag":"storage","feature": "25GB storage","quantity":0,"amount": 30,"action":"remove"},
					{"tag":"user","feature": "Additional users","amount": 15,"quantity":5,"action":"add"}
				],
				"subscription": "month",
				"quantity":	1
			}
		*/

		$plan = new CustomPlanStruct();

		$totamount = 0.0;
		foreach ($planInfo->attributes as $attribute) {
			if($attribute->action === "add")
				$totamount += (float)$attribute->amount;
		}

		$plan->plan = "custom";
		$plan->pacakgeAmount = $totamount;
		$plan->planDetails = $planInfo->attributes;
		$plan->interval = $planInfo->subscription;
		$plan->quantity = (isset($planInfo->quantity)) ? (int)$planInfo->quantity : 1;
		unset($plan->customer);
		unset($plan->token);

		$res = $this->cClient->getRequestInvoker()->post("/upgrade", $plan);
		return $this->getDefaultValue($res);

	}

	public function stopSubscription($now = false) {

		$stopplan = new stdClass();
		if($now) $stopplan->action = "immediate";
		else $stopplan->action = "eod";

		$res = $this->cClient->getRequestInvoker()->post("/permanentDisconnect", $stopplan);
		return $this->getDefaultValue($res);

	}

	public function resubscribe() {
		$res = $this->cClient->getRequestInvoker()->post("/reinstall", json_decode('{"type":"package"}'));
		return $this->getDefaultValue($res);

	}

	public function checkSubscription() {
		$res = $this->cClient->getRequestInvoker()->get("/subscriberCheck");
		return $this->getDefaultValue($res);

	}

	private function getDefaultValue($res){

		$jsonObj =json_decode($res);
		if (!$jsonObj){
			$jsonObj = new stdClass();
			$jsonObj->status = false;
			$jsonObj->response = $res;
		}
		return $jsonObj;

	}

	function __construct($cClient) {
		$this->cClient = $cClient;
	}

}

class CloudCharge {

	private $invoker;

	public function user() {
		return new User($this);
	}

	public function card() {
		return new Card($this);
	}

	public function plan() {
		return new Plan($this);
	}

	public function app() {
		return new App($this);
	}

	public function getRequestInvoker() {
		if(property_exists($this, "invoker"))
			return $this->invoker;
	}

	function __construct($paygateway = "") {

		if($paygateway === "")
			if(defined("PAYMENT_GATWAY"))
				$paygateway = PAYMENT_GATWAY;

		//$this->invoker = new WsInvoker("http://". $GLOBALS['mainDomain'] ."/services/duosoftware.paymentgateway.service/" . $paygateway);
		$this->invoker = new WsInvoker("http://cloudcharge.com/services/duosoftware.paymentgateway.service/" . $paygateway);
		$this->invoker->addHeader("securityToken", $_COOKIE['securityToken']);
		$this->invoker->addHeader("idToken", $_COOKIE['securityToken']);
	}

}

/*

	(new CloudCharge())->user()->get();

	(new CloudCharge())->card()->add($token [,$default]); // invoke to create a new card.
	(new CloudCharge())->card()->getInfo(); // invoke to retrive card details of user. this will return all cards infomations that user has entered.
	(new CloudCharge())->card()->remove($cardId); //invoke to remove a card.
	(new CloudCharge())->card()->setAsDefault($cardId); invoke to set a card as default.

	(new CloudCharge())->plan()->subscribeToFixedplan($token ,$planInfo);
		{"plan":"Gold", "amount": 10, "quantity":1}

	(new CloudCharge())->plan()->subscribeToCustomplan($token ,$planInfo);
		{
			"attributes":  [{"tag":"Package","feature": "Gold Package","amount": 20,"quantity":0,"action":"add"},{"tag":"user","feature": "Additional +1 user","amount": 10, "quantity":5,"action":"add"}],
			"subscription": "month",
			"quantity":	1
		}

	(new CloudCharge())->plan()->customize($planInfo);
		{
			"features": [
				{"tag":"storage","feature": "25GB storage","quantity":0,"amount": 30,"action":"remove"},
				{"tag":"user","feature": "Additional users","amount": 15,"quantity":5,"action":"add"}
			]
		}

	(new CloudCharge())->plan()->upgradeToFixedplan($planInfo);
		{"plan":"Gold", "amount": 10, "quantity":1}

	(new CloudCharge())->plan()->upgradeToCustomplan($planInfo);
		{
			"attributes": [
				{"tag":"storage","feature": "25GB storage","quantity":0,"amount": 30,"action":"remove"},
				{"tag":"user","feature": "Additional users","amount": 15,"quantity":5,"action":"add"}
			],
			"subscription": "month",
			"quantity":	1
		}

	(new CloudCharge())->plan()->stopSubscription([$stopnow]);
	(new CloudCharge())->plan()->resubscribe();
	(new CloudCharge())->plan()->checkSubscription();

	(new CloudCharge())->app()->create($app); // invoke during app publishing
	(new CloudCharge())->app()->purchase($appkey, $price [,$token]); // invoke during one time payment app purchase
	(new CloudCharge())->app()->subscribe($appkey [,$token]); //invoke during app subscription
	(new CloudCharge())->app()->withinSubscriptionPeriod(); // invoke to retrive all app in subcription period
	(new CloudCharge())->app()->reinstall($appkey); //invoke during app reinstallation
	(new CloudCharge())->app()->uninstall($appkey); //invoke during app uninstallation


*/

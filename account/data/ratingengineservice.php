<?php

//require_once($_SERVER["DOCUMENT_ROOT"]. 'duosoftware.ratingEngine/models/invoicehandler.php');
require_once('HttpRequestHelper.php');
//require_once($_SERVER["DOCUMENT_ROOT"]. '/duosoftware.ratingEngine/portal/processPayment');
    $method = "";
    ini_set('display_errors', '0');
    if (isset ( $_GET ["method"] ))
    	$method = $_GET ["method"];

    switch ($method) {

		case "updaterule" :
			$data = $_GET ["data"];
			$meta = $_GET ["meta"];
			//var_dump($data);
			$ratingEngine=new RatingEngineService();
			echo $ratingEngine->updateRule($data,$meta);
			break;

			case "processrule" :
      			$data = $_GET ["data"];
      			$meta = $_GET ["meta"];
      			//var_dump($data);
      			$ratingEngine=new RatingEngineService();
      			echo $ratingEngine->processRule($data,$meta);
      			break;

    	case "" :
    		header ( 'HTTP/1.1 404 Not Found' );
    		break;
    }
    class RatingEngineService {
    private $headerArray;
    private function string_decrypt($ciphertext_base64) {


		$key = pack('H*', "bcb04b7e103a0cd8b54763051cef08bc55abe029fdebae5e1d417e2ffb2a00a3");
		$ciphertext_dec = base64_decode($ciphertext_base64);
		$iv_size = mcrypt_get_iv_size(MCRYPT_RIJNDAEL_128, MCRYPT_MODE_CBC);
		$iv_dec = substr($ciphertext_dec, 0, $iv_size);
        //var_dump($iv_dec);exit();
		$ciphertext_dec = substr($ciphertext_dec, $iv_size);

		$plaintext_dec = mcrypt_decrypt(MCRYPT_RIJNDAEL_128, $key,$ciphertext_dec, MCRYPT_MODE_CBC, $iv_dec);
		//echo  $plaintext_dec . "\n";
		$plaintext_dec = preg_replace('/[\x00-\x08\x10\x0B\x0C\x0E-\x19\x7F]'.
         '|[\x00-\x7F][\x80-\xBF]+'.
         '|([\xC0\xC1]|[\xF0-\xFF])[\x80-\xBF]*'.
         '|[\xC2-\xDF]((?![\x80-\xBF])|[\x80-\xBF]{2,})'.
         '|[\xE0-\xEF](([\x80-\xBF](?![\x80-\xBF]))|(?![\x80-\xBF]{2})|[\x80-\xBF]{3,})/S',
         '', $plaintext_dec );
		return $plaintext_dec;
	}

	public function addHeader($k, $v){
    		array_push($this->headerArray, $k . ": " . $v);
	}

	public function updateRule($data,$meta)
	{
	      //$data=json_decode($data);
        $meta=json_decode($meta);
        //$plaintext_dec=$this->string_decrypt($meta);
        //$portalData = json_decode($plaintext_dec,true);
        //var_dump($data);
        //var_dump($meta);
        $domainUrl=$meta->domainUrl;
        $staticToken=$meta->securityToken;
        $req=new HttpRequestHelper();
        $this->headerArray=array();
        $url='http://'.$domainUrl.'/services/duosoftware.ratingEngine/ratingEngine/createRule';
        //var_dump($url);
        $this->addHeader('idToken', $staticToken);
        $this->addHeader('Content-Type', 'application/json');
        $responce=$req->Post($data,$url, $this->headerArray);
        return $responce;
	}

	public function processRule($data,$meta)
  	{
  	      //$data=json_decode($data);
          $meta=json_decode($meta);
          //$plaintext_dec=$this->string_decrypt($meta);
          //$portalData = json_decode($plaintext_dec,true);
          //var_dump($data);
          //var_dump($meta);
          $domainUrl=$meta->domainUrl;
          $staticToken=$meta->securityToken;
          $req=new HttpRequestHelper();
          $this->headerArray=array();
          $url='http://'.$domainUrl.'/services/duosoftware.ratingEngine/ratingEngine/process';
          //var_dump($url);
          $this->addHeader('idToken', $staticToken);
          $this->addHeader('Content-Type', 'application/json');
          $responce=$req->Post($data,$url, $this->headerArray);
          return $responce;
  	}



}
?>

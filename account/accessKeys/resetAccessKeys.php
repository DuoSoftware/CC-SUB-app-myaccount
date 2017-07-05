<?php
    require_once('../data/HttpRequestHelper.php');
    $resetType = "";
    $id = "";
    $primaryURL = 'http://app.cloudcharge.com/services/apis.php/auth/regeneratePrimaryKey';
    $secondaryURL = 'http://app.cloudcharge.com/services/apis.php/auth/regenerateSecondaryKey';

    if (isset ( $_GET ["resetType"] ))
        	$resetType = $_GET ["resetType"];

    if (isset ( $_GET ["id"] ))
        	$id = $_GET ["id"];

    $headerObj->id_token = $id;
    $header = json_encode($headerObj);

    if($resetType == 'primary'){
        resetPrimaryKey();
    }elseif($resetType == 'secondary'){
        resetSecondaryKey();
    }

	public function resetPrimaryKey(){
        $getPrimary = new HttpRequestHelper();
        $newPrimaryKey = $getPrimary->Get($primaryURL, $header);
        return $newPrimaryKey;
    }

    public function resetSecondaryKey(){
        $getSecondary = new HttpRequestHelper();
        $newSecondaryKey = $getSecondary->Get($secondaryURL, $header);
        return $newSecondaryKey;
    }
?>
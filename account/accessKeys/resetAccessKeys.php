<?php
    require_once('HttpRequestHelper.php');
    $resetType = "";
    $id = "";
    $primaryURL = 'http://app.cloudcharge.com/services/apis.php/auth/regeneratePrimaryKey';
    $secondaryURL = 'http://app.cloudcharge.com/services/apis.php/auth/regenerateSecondaryKey';

    if (isset ( $_GET ["resetType"] ))
        	$resetType = $_GET ["resetType"];

    if (isset ( $_GET ["id"] ))
        	$id = $_GET ["id"];

    echo "<script type='text/javascript'>alert('$id');</script>"

    $header->addHeader('id_token', $id);

    if($resetType == 'primary'){
        resetPrimaryKey();
    }elseif($resetType == 'secondary'){
        resetSecondaryKey();
    }

	public function resetPrimaryKey(){
        $getPrimary = new HttpRequestHelper();
        $newPrimaryKey = $getPrimary->GET($primaryURL, $header);
        return $newPrimaryKey;
    }

    public function resetSecondaryKey(){
        $getSecondary = new HttpRequestHelper();
        $newSecondaryKey = $getSecondary->GET($secondaryURL, $header);
        return $newSecondaryKey;
    }
?>
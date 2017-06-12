<?php
$server_environment = 'dev'; // local/live



// check PHP Variables in php info.php file

switch ($server_environment) {

	case 'dev' :
	    define('host','dev.cloudcharge.com');


		break;

	case 'qa' :
	    define('host','qa.cloudcharge.com');

		break;


		case 'live' :
	    define('host','cloudcharge.com');

		break;
}

?>

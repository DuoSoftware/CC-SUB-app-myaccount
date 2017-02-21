<?php


setcookie("planId", $_GET['plan']);
setcookie("price", $_GET['price']);
setcookie("name", $_GET['name']);
setcookie("tenantID", $_GET['tenantID']);
setcookie("selectedPlan", $_GET['selectedPlan']);
setcookie("paymentStatus", $_GET['paymentStatus']);

if(isset($_GET['stripeToken']))
  setcookie("stripeToken", $_GET['stripeToken']);

setcookie("isRefreshed", '1');
//."/".$_GET['st']."/".$_GET['price']."/".$_GET['name']."/".$_GET['tenantID']);


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


//print_r($_COOKIE);
//exit();

if(isset($_COOKIE['isRefreshed'])){
  unset($_COOKIE['isRefreshed']);
}else{
  header("Refresh:0");
  exit();
}

//exit();

 if(isset($_COOKIE['planId'])) {

      header('Location: charge.php?bla=sssssssssss');

 } else {

     header('Location: ../#/account');
 }
 //header('Location: ../#/proceed?plan=');

?>

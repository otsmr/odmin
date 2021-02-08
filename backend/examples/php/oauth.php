<?php 

function goHome(){
    header("Location: ../");
    die();
}

if (isset($_GET["logout"])) {
    setcookie("token", "", time()-3600);
} else {
    if(isset($_GET['token'])) setcookie("token", $_GET['token'], time()+3600*30*60, "/");
    else goHome();
}

if(isset($_GET['return_to']) && $_GET['return_to'] !== "null") header("Location: " . $_GET['return_to']);
else goHome();
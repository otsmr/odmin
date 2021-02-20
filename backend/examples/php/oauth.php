<?php

require_once "config.php";
require_once "odmin.php";

$odmin = new \ODMIN\OAuth((object) [
    "secret" => $config->odmin_secret,
    "service_id" => $config->odmin_service_id,
    "api_base" => $config->odmin_base_url,
    "signin_base" => $config->odmin_signin_base
]);

function home () {
    // print("Location: ./index.php");
    header("Location: ./index.php");
    die();
}

if (isset($_GET["logout"])) {

    setcookie("odmin_token", "", time()-3600);

} else if (isset($_GET["code"])) {

    $odmin->handle_oauth_code((string) $_GET["code"]);

} else home();

if(isset($_GET['continue']) && $_GET['continue'] !== "null") {

    $continue = (string) urldecode((string) $_GET['continue']);

    //! FIXME: check is this secure (only relative urls!) ??
    
    if ($continue[0] !== "/") home();
    if (
        strrpos($continue, "http:") !== false ||
        strrpos($continue, "https:") !== false
    ) home();

    // print("Location: $continue");
    header("Location: $continue");
    die();

}

home();
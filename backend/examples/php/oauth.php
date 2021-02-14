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
    header("Location: ./index.php");
    die();
}

if (!isset($_GET["code"])) home();

// TODO: failed?
$odmin->handle_oauth_code((string) $_GET["code"]);

if(isset($_GET['continue']) && $_GET['continue'] !== "null") {

    $continue = (string) urldecode((string) $_GET['continue']);

    //! FIXME: check is this secure (only relative urls!) ??
    
    if ($continue[0] !== "/") home();
    if (
        strrpos($continue, "http:") !== false ||
        strrpos($continue, "https:") !== false
    ) home();

    header("Location: $continue");
    die();

}

home();
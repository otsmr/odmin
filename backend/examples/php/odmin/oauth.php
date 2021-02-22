<?php

require_once "../config.php";
require_once "odmin.php";

$odmin = new \ODMIN\OAuth((object) [
    "secret" => $config->odmin_secret,
    "service_id" => $config->odmin_service_id,
    "api_base" => $config->odmin_base_url
]);

$default_location = "./../index.php";

if (isset($_GET["logout"])) {

    $odmin->handle_logout((int) $_GET["logout"]);

} else if (isset($_GET["code"])) {

    $odmin->handle_oauth_code((string) $_GET["code"]);

} else {
    
    header("Location: $default_location");
    die();

}

$odmin->handle_continue_location($default_location);
<?php

require_once "init.php";

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
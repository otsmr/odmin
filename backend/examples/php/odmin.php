<?php 

require_once "config.php";


function get_odmin_login_url () {
    global $config;

    return $config->odmin_base_url . "/signin?serviceid=" . $config->odmin_client_id . "&continue=%2Fprivat.php";

}


function get_odmin_logout_url () {
    
}
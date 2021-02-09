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

if(isset($_GET['continue']) && $_GET['continue'] !== "null") {

    // TODO: is this secure (only relative urls!)??
    if ($_GET['continue'][0] !== "/") goHome();

    header("Location: " . $_GET['continue']);
    die();
}
goHome();
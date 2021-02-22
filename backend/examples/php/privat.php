<?php 

require_once "odmin/init.php";

$odmin->init_session_from_cookie();

if (!$odmin->is_logged_in()) {
    header("Location: ./index.php");
    die();
}

?>

<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <title>Odmin OAuth-Test</title>
</head>
<body style="background: #111; color: #aaa;">

    <a href="./index.php">Zurück</a>

    <h1>Hallo <?php echo html_entity_decode($odmin->session->user_name); ?>!</h1>

    <p>Dein geheimes Passwort ist 12345678.</p>
    
</body>
</html>
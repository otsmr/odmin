<?php 

require_once "config.php";
require_once "odmin.php";

$odmin = new \ODMIN\OAuth((object) [
    "secret" => $config->odmin_secret,
    "service_id" => $config->odmin_service_id,
    "api_base" => $config->odmin_base_url,
    "signin_base" => $config->odmin_signin_base
]);

$odmin->init_session_from_cookie();

?>

<!DOCTYPE html>
<html lang="en">
<head>

    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Odmin OAuth-Test</title>

    <style>
        body { background: #111; color: #aaa; }
    </style>

</head>
<body>

<?php if ($odmin->is_logged_in()): ?>

    <h1>Hallo <?php echo html_entity_decode($odmin->session->user_name); ?>!</h1>
    <a href="<?php echo $odmin->get_signout_url(); ?>">Abmelden</a>

<?php else: ?>
    <a href="<?php echo $odmin->get_signin_url("/privat.php"); ?>">Anmelden</a>
<?php endif; ?>

</body>
</html>
<?php 

require_once "odmin/init.php";

$odmin->init_session_from_cookie();

?>

<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <title>Odmin OAuth-Test</title>
</head>
<body style="background: #111; color: #aaa;">

<?php if ($odmin->is_logged_in()): ?>

    <h1>Hallo <?php echo html_entity_decode($odmin->session->user_name); ?>!</h1>
    <a href="<?php echo $odmin->get_signout_url(); ?>">Abmelden</a>

<?php else: ?>

    <a href="<?php echo $odmin->get_signin_url("/privat.php"); ?>">Anmelden</a>
    
<?php endif; ?>

</body>
</html>
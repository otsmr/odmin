<?php 

require_once "odmin.php"

?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Odmin OAuth-Test</title>

    <style>
    
        body {
            background: #111;
            color: #aaa;
        }

    </style>

</head>
<body>

    <a href="<?php echo get_odmin_login_url(); ?>">Anmelden</a>
    
</body>
</html>
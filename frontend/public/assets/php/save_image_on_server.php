<?php
header('Access-Control-Allow-Origin: *');

if(isset($_FILES['file']) and !$_FILES['file']['error']){
    // Check if user folder exists
    $uid = $_POST["uid"];
    $dir = "../../db/users/" . $uid . "/img/";
    if ( !is_dir( $dir) ) {
    mkdir( $dir, $permissions=0777, $recursive=true);
    }
    $fname = $_FILES['file']["name"] . ".png";

    if (move_uploaded_file($_FILES['file']['tmp_name'], $dir . $fname)){
        echo json_encode('Picture saved in server: ' . $dir . $fname);
    } else {
        echo json_encode(array('Picture could not be saved.'));
    }

} else {
    echo json_encode(array('There is a problem with the uploaded file.'));
}

?>

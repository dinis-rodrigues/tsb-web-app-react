<?php
header('Access-Control-Allow-Origin: *');

$userId = $_POST['userId'];


if($_POST['userId']){
    $userId = $_POST['userId'];
    // Check if user folder exists
    $dir = "../../db/users/" . $userId. "/";
    // create directory of the topic
    if ( !is_dir( $dir) ) {
    mkdir( $dir, $permissions=0777, $recursive=true);
    }
    // move topic template to folder
    $fname = $userId . ".html";

    if (copy('../../assets/templates/user_profile.html', $dir.$fname )){
        echo json_encode('Html created saved in server: ' . $dir . $fname);
    } else {
        echo json_encode(array('Html could not be created.'));
    }

} else {
    echo json_encode(array('There is a problem with the uploaded information.'));
}
?>
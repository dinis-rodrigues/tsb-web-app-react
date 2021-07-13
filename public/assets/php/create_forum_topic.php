<?php
header('Access-Control-Allow-Origin: *');

$topicName = $_POST['topicName'];
$sectionName = $_POST['sectionName'];


if($_POST['topicName'] and $_POST['sectionName']){
    $topicName = $_POST['topicName'];
    $sectionName = $_POST['sectionName'];
    // Check if user folder exists
    $uid = $_POST["uid"];
    $dir = "../../forum/" . $sectionName . "/";
    // create directory of the topic
    if ( !is_dir( $dir) ) {
    mkdir( $dir, $permissions=0777, $recursive=true);
    }
    // move topic template to folder
    
    $fname = $topicName . ".html";

    if (copy('../../assets/templates/forum_topic_template.html', $dir.$fname )){
        echo json_encode('Html created saved in server: ' . $dir . $fname);
    } else {
        echo json_encode(array('Html could not be created.'));
    }

} else {
    echo json_encode(array('There is a problem with the uploaded information.'));
}
?>

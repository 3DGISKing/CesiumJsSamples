<?php

header('Cache-Control: no-cache, must-revalidate');
header('Expires: Mon, 26 Jul 1997 05:00:00 GMT');
header('Content-type: application/json');
header('Access-Control-Allow-Headers: Content-Type');
header("Access-Control-Allow-Origin: *");

$json = $_POST['json'];
$link_name = $_POST['linkName'];

$filename = $link_name . '.json';

$target_dir = "uploads/";
$target_file = $target_dir . $filename;

// Check if file already exists
if (file_exists($target_file)) {
    echo json_encode(array('error'=> $link_name . ' already exists.'));
    exit;
}

$fp = fopen($target_file, 'w');

fwrite($fp, $json);
fclose($fp);

echo json_encode(array('json_file'=>$filename, 'error'=>''));








<?php

header('Cache-Control: no-cache, must-revalidate');
header('Expires: Mon, 26 Jul 1997 05:00:00 GMT');
header('Content-type: application/json');
header('Access-Control-Allow-Headers: Content-Type');
header("Access-Control-Allow-Origin: *");

define('UPLOAD_DIR', 'uploads/pdf/');

// Check if dir exists
if (!file_exists(UPLOAD_DIR)) {
    echo json_encode(array('error' => 'Upload dir does not exist'));
    exit;
}

$uploaded_file_name = 'uploadedPdfFile';

//$file_name = basename($_FILES[$uploaded_file_name]["name"]);

// for testing
$file_name = uniqid(rand(), true) . '.' . 'pdf';

$target_file = UPLOAD_DIR . $file_name;

// Check if file already exists
if (file_exists($target_file)) {
    echo json_encode(array('error' => 'Sorry, file already exists.'));
    exit;
}

$file_type = strtolower(pathinfo($target_file, PATHINFO_EXTENSION));

// Allow certain file formats
if ($file_type != "pdf") {
    echo json_encode(array('error' => 'Sorry, only PDF files are allowed.'));
    exit;
}

if (move_uploaded_file($_FILES[$uploaded_file_name]["tmp_name"], $target_file)) {
    echo json_encode(array('pdf' => $file_name, 'error' => ''));
    exit;
} else {
    $error_code = $_FILES[$uploaded_file_name]['error'];

    $error_message = '';

    if ($error_code == UPLOAD_ERR_INI_SIZE) {
        $error_message = 'The uploaded file exceeds the upload_max_filesize directive in php.ini.';
    } else if ($error_code == UPLOAD_ERR_FORM_SIZE) {
        $error_message = 'The uploaded file exceeds the MAX_FILE_SIZE directive that was specified in the HTML form.';
    } else if ($error_code == UPLOAD_ERR_PARTIAL) {
        $error_message = 'The uploaded file was only partially uploaded.';
    } else if ($error_code == UPLOAD_ERR_NO_FILE) {
        $error_message = 'No file was uploaded.';
    } else if ($error_code == UPLOAD_ERR_NO_TMP_DIR) {
        $error_message = 'Missing a temporary folder';
    } else if ($error_code == UPLOAD_ERR_CANT_WRITE) {
        $error_message = 'Failed to write file to disk';
    } else if ($error_code == UPLOAD_ERR_EXTENSION) {
        $error_message = 'A PHP extension stopped the file upload.';
    }
    else {
        $error_message = 'Unknown error!';
    }

    echo json_encode(array('error' => 'Sorry, there was an error uploading your file.' . $error_message));
    exit;
}


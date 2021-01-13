<?php

header('Cache-Control: no-cache, must-revalidate');
header('Expires: Mon, 26 Jul 1997 05:00:00 GMT');
header('Content-type: application/json');
header('Access-Control-Allow-Headers: Content-Type');
header("Access-Control-Allow-Origin: *");

$target_dir = "uploads/";

// Check if dir exists
if (!file_exists($target_dir)) {
    echo json_encode(array('error'=>'Upload dir does not exist'));
    exit;
}

$target_file = $target_dir . basename($_FILES["fileToUpload"]["name"]);
$imageFileType = strtolower(pathinfo($target_file,PATHINFO_EXTENSION));
$filename = uniqid(rand(), true) . '.' . $imageFileType;

$target_file = $target_dir . $filename;

// Check if image file is a actual image or fake image
if(isset($_POST["submit"])) {
    $check = getimagesize($_FILES["fileToUpload"]["tmp_name"]);

    if($check == false) {
        echo json_encode(array('error'=>'Can not get image size. Maybe uploaded file looks not image'));
        exit;
    }
}

// Check if file already exists
if (file_exists($target_file)) {
    echo json_encode(array('error'=>'Sorry, file already exists.'));
    exit;
}

// Allow certain file formats
if($imageFileType != "jpg" && $imageFileType != "png" && $imageFileType != "jpeg" && $imageFileType != "gif_onAddImagePushpin" ) {
    echo json_encode(array('error'=>'Sorry, only JPG, JPEG, PNG & GIF files are allowed.'));
    exit;
}

if (move_uploaded_file($_FILES["fileToUpload"]["tmp_name"], $target_file)) {
    $image_info = getimagesize($target_file);

    echo json_encode(array('image'=>$filename, 'width'=>$image_info[0], 'height'=>$image_info[1], 'error'=>''));
    exit;
} else {
    $error_code = $_FILES['fileToUpload']['error'];

    $error_message = '';

    if($error_code == UPLOAD_ERR_INI_SIZE) {
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

    echo json_encode(array('error'=>'Sorry, there was an error uploading your file.' . $error_message));
    exit;
}

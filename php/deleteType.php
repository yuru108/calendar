<?php
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $typeName = isset($_POST['typeName']) ? trim($_POST['typeName']) : '';

    if ($typeName) {
        $filePath = '../source/DataTypeList.txt';
        $fileContents = file($filePath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);

        $updatedContents = array_filter($fileContents, function ($line) use ($typeName) {
            return strpos($line, $typeName . ', ') !== 0;
        });

        if (file_put_contents($filePath, implode(PHP_EOL, $updatedContents) . PHP_EOL)) {
            echo 'Type deleted successfully';
        } else {
            echo 'Error deleting type';
        }
    } else {
        echo 'Invalid input';
    }
} else {
    echo 'Invalid request method';
}
?>
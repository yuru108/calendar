<?php
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $typeName = isset($_POST['typeName']) ? trim($_POST['typeName']) : '';

    if ($typeName) {
        $dataTypeFilePath = '../source/DataTypeList.txt';
        $dataTypeFileContents = file($dataTypeFilePath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);

        $updatedDataTypeContents = array_filter($dataTypeFileContents, function ($line) use ($typeName) {
            return strpos($line, $typeName . ', ') !== 0;
        });

        if (file_put_contents($dataTypeFilePath, implode(PHP_EOL, $updatedDataTypeContents) . PHP_EOL)) {
            echo 'Type deleted successfully';

            $dateListDir = '../source/DateList/';
            $files = glob($dateListDir . '*.txt');

            foreach ($files as $filePath) {
                $fileContents = file($filePath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
                $updatedContents = [];

                foreach ($fileContents as $line) {
                    $columns = explode(', ', $line);
                    $updatedColumns = array_map(function ($column) use ($typeName) {
                        return trim($column) === $typeName ? '' : $column;
                    }, $columns);
                    $updatedContents[] = implode(', ', $updatedColumns);
                }
                file_put_contents($filePath, implode(PHP_EOL, $updatedContents) . PHP_EOL);
            }
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
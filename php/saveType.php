<?php
function formatPeriods($periods)
{
    $formatted = [];
    foreach ($periods as $period) {
        $formatted[] = implode(', ', $period);
    }
    return implode(', ', $formatted);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $originalType = isset($_POST['originalType']) ? trim($_POST['originalType']) : '';
    $newType = isset($_POST['newType']) ? trim($_POST['newType']) : '';
    $typeColor = isset($_POST['typeColor']) ? trim($_POST['typeColor']) : '';
    $periods = isset($_POST['periods']) ? json_decode($_POST['periods'], true) : [];

    $filename = '../source/DataTypeList.txt';
    $lines = file($filename, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    $updated = false;

    if ($originalType) {
        $newLines = [];
        foreach ($lines as $line) {
            list($typeName, $color, $dataPeriods) = explode(', ', $line, 3) + [null, null, ''];
            if ($typeName === $originalType) {
                $newLine = $newType . ', ' . $typeColor . ', ' . formatPeriods($periods) . "\n";
                $newLines[] = $newLine;
                $updated = true;
            } else {
                $newLines[] = $line . "\n";
            }
        }
        if ($updated) {
            file_put_contents($filename, implode('', $newLines));
            echo 'Type updated successfully';

            $dateListDir = '../source/DateList/';
            $files = glob($dateListDir . '*.txt');

            foreach ($files as $filePath) {
                $fileContents = file($filePath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
                $updatedContents = [];

                foreach ($fileContents as $line) {
                    $updatedLine = str_replace($originalType, $newType, $line);
                    $updatedContents[] = $updatedLine;
                }

                file_put_contents($filePath, implode(PHP_EOL, $updatedContents) . PHP_EOL);
            }
        } else {
            echo 'Type not found';
        }
    } else {
        $newLine = $newType . ', ' . $typeColor . ', ' . formatPeriods($periods) . "\n";
        file_put_contents($filename, $newLine, FILE_APPEND);
        echo 'Type saved successfully';
    }
}
?>
<?php
$data = json_decode(file_get_contents('php://input'), true);

$selectedDates = $data['selectedDates'];
$selectedType = $data['selectedType'];

$dateGroups = [];
foreach ($selectedDates as $date) {
    $year = substr($date, 0, 4);
    if (!isset($dateGroups[$year])) {
        $dateGroups[$year] = [];
    }
    $dateGroups[$year][] = $date;
}

$updatedData = [];
foreach ($dateGroups as $year => $dates) {
    $filePath = "../source/DateList/$year.txt";
    if (file_exists($filePath)) {
        $fileContents = file($filePath, FILE_IGNORE_NEW_LINES);
        foreach ($dates as $date) {
            $month = (int) substr($date, 5, 2);
            $day = (int) substr($date, 8, 2);

            if (isset($fileContents[$month - 1])) {
                $line = &$fileContents[$month - 1];
                $columns = explode(', ', $line);

                if (isset($columns[$day - 1])) {
                    $columns[$day - 1] = trim($selectedType);
                    $line = implode(', ', $columns);
                }
            }
        }
        file_put_contents($filePath, implode(PHP_EOL, $fileContents) . PHP_EOL);
        $updatedData[$year] = file($filePath, FILE_IGNORE_NEW_LINES);
    } else {
        echo json_encode(['error' => "File for year $year not found."]);
        exit;
    }
}

echo json_encode(['success' => true, 'updatedData' => $updatedData]);
?>
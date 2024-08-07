<?php
$data = json_decode(file_get_contents('php://input'), true);

$selectedDates = $data['selectedDates'];
$selectedType = $data['selectedType'] ?? null;
$action = $data['action'];

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

    if (!file_exists($filePath)) {
        if ($action === 'clear') {
            continue;
        }

        $fileContents = [];
        $daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

        if ((($year % 4 == 0) && ($year % 100 != 0)) || ($year % 400 == 0)) {
            $daysInMonth[1] = 29;
        }

        foreach ($daysInMonth as $days) {
            $fileContents[] = str_repeat(', ', $days - 1);
        }
    } else {
        $fileContents = file($filePath, FILE_IGNORE_NEW_LINES);
    }

    foreach ($dates as $date) {
        $month = (int) substr($date, 5, 2);
        $day = (int) substr($date, 8, 2);

        if (isset($fileContents[$month - 1])) {
            $line = &$fileContents[$month - 1];
            $columns = explode(', ', $line);

            if (isset($columns[$day - 1])) {
                if ($action === 'save') {
                    $columns[$day - 1] = trim($selectedType);
                } elseif ($action === 'clear') {
                    $columns[$day - 1] = '';
                }
                $line = implode(', ', $columns);
            }
        }
    }

    file_put_contents($filePath, implode(PHP_EOL, $fileContents) . PHP_EOL);
    $updatedData[$year] = file($filePath, FILE_IGNORE_NEW_LINES);
}

echo json_encode(['success' => true, 'updatedData' => $updatedData]);
?>
<?php
// ============================================================
//  AI Grammar Corrector — Backend API Handler (correct.php)
//  Receives text via POST, calls Gemini, returns JSON response
// ============================================================

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require_once 'config.php';

// Only accept POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['error' => 'Only POST requests are allowed.']);
    exit;
}

// Get and sanitize input
$inputText = trim($_POST['text'] ?? '');

if (empty($inputText)) {
    echo json_encode(['error' => 'Please enter some text to correct.']);
    exit;
}

if (strlen($inputText) > 5000) {
    echo json_encode(['error' => 'Text is too long. Please keep it under 5000 characters.']);
    exit;
}

// Build Gemini prompt
$prompt = "You are a professional grammar correction assistant. Correct the grammar, spelling, and punctuation of the following text. Return ONLY the corrected text — no explanations, no extra commentary, no quotes, just the corrected version of the input text.\n\nText to correct:\n" . $inputText;

// Build the request body
$requestBody = json_encode([
    'contents' => [
        [
            'parts' => [
                ['text' => $prompt]
            ]
        ]
    ],
    'generationConfig' => [
        'temperature' => 0.1,
        'maxOutputTokens' => 2048
    ]
]);

// Make the API call using cURL
$ch = curl_init(GEMINI_API_URL . '?key=' . GEMINI_API_KEY);
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST           => true,
    CURLOPT_POSTFIELDS     => $requestBody,
    CURLOPT_HTTPHEADER     => ['Content-Type: application/json'],
    CURLOPT_TIMEOUT        => 30,
    CURLOPT_SSL_VERIFYPEER => false // For local XAMPP environments
]);

$response     = curl_exec($ch);
$httpCode     = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlError    = curl_error($ch);
curl_close($ch);

// Handle cURL errors
if ($curlError) {
    echo json_encode(['error' => 'Connection error: ' . $curlError]);
    exit;
}

// Parse Gemini response
$decoded = json_decode($response, true);

if ($httpCode !== 200) {
    $errMsg = $decoded['error']['message'] ?? 'Unknown API error (HTTP ' . $httpCode . ')';
    echo json_encode(['error' => 'Gemini API Error: ' . $errMsg]);
    exit;
}

$correctedText = $decoded['candidates'][0]['content']['parts'][0]['text'] ?? null;

if (!$correctedText) {
    echo json_encode(['error' => 'Could not extract corrected text from the API response.']);
    exit;
}

echo json_encode([
    'success'   => true,
    'original'  => $inputText,
    'corrected' => trim($correctedText)
]);

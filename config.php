<?php
// ============================================================
//  AI Grammar Corrector — Configuration
// ============================================================

// Load local settings (like your private API key) if they exist
if (file_exists(__DIR__ . '/config.local.php')) {
    require_once __DIR__ . '/config.local.php';
}

// Fallback to placeholder if not defined in config.local.php
if (!defined('GEMINI_API_KEY')) {
    define('GEMINI_API_KEY', 'YOUR_GEMINI_API_KEY_HERE');
}

if (!defined('GEMINI_API_URL')) {
    define('GEMINI_API_URL', 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent');
}


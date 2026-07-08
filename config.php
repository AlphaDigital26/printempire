<?php

$env = [];

foreach (file(__DIR__.'/.env', FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $line) {

    if (str_starts_with(trim($line), '#')) {
        continue;
    }

    [$key, $value] = explode('=', $line, 2);

    $env[$key] = $value;
}

define('SMTP_HOST', $env['SMTP_HOST']);
define('SMTP_PORT', $env['SMTP_PORT']);
define('SMTP_USERNAME', $env['SMTP_USERNAME']);
define('SMTP_PASSWORD', $env['SMTP_PASSWORD']);

define('COMPANY_EMAIL', $env['COMPANY_EMAIL']);
define('COMPANY_NAME', $env['COMPANY_NAME']);

define('FROM_EMAIL', $env['FROM_EMAIL']);
define('FROM_NAME', $env['FROM_NAME']);

define('CSRF_SECRET', $env['CSRF_SECRET']);
<?php
/**
 * login.php — JSON login endpoint for the X2P app.
 *
 * You don't have direct DB access to the reap.emeraldclothing.com database,
 * so instead of querying it directly this proxies to the REAL, already
 * working login page:
 *
 *   POST https://reap.emeraldclothing.com/emerald/main.php
 *        txtusername=...&txtPassword=...&requestedPage=/emerald/main.php
 *
 * That endpoint (see the legacy login.php you shared) checks the credentials
 * against companies/useraccounts and either:
 *   - redirects (302/301) to the requested page on success, setting a
 *     PHPSESSID cookie, or
 *   - re-renders the login page (200) with an error message inside
 *     <div id="txterror"> on failure (bad credentials, or intReset != 1
 *     meaning the account needs a password reset).
 *
 * This file makes that request from the server via curl — no browser CORS
 * involved — and turns the result into the JSON contract src/lib/auth.js
 * expects, forwarding the legacy PHPSESSID as our own cookie/token.
 *
 * Deploy this file wherever VITE_AUTH_API_URL + "/login" should resolve to,
 * on any PHP host (with curl enabled) that can reach reap.emeraldclothing.com
 * over HTTPS — it does not need to be the same server.
 *
 * Request:  POST { "username": "...", "password": "..." }
 * Response: 200 { "ok": true,  "token": "...", "user": { name, title, entity, department, role } }
 *           401 { "ok": false, "message": "..." }
 *           403 { "ok": false, "message": "Your password needs to be reset before you can sign in." }
 *           400 { "ok": false, "message": "Username and password are required." }
 *           502 { "ok": false, "message": "Could not reach the login service." }
 */

declare(strict_types=1);

error_reporting(E_ALL);
ini_set('display_errors', '0'); // never leak stack traces/db errors to the client
header('Content-Type: application/json');

// CORS — lock this down to your actual app origin(s) once you know the
// deployed domain, instead of '*'.
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

function respond(int $status, array $body): void
{
    http_response_code($status);
    echo json_encode($body);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond(405, ['ok' => false, 'message' => 'Method not allowed.']);
}

$input = json_decode((string) file_get_contents('php://input'), true);
$username = isset($input['username']) ? trim((string) $input['username']) : '';
$password = isset($input['password']) ? (string) $input['password'] : '';

if ($username === '' || $password === '') {
    respond(400, ['ok' => false, 'message' => 'Username and password are required.']);
}

// The real login endpoint this proxies to. Change if the app ever moves.
const LEGACY_LOGIN_URL = 'https://reap.emeraldclothing.com/emerald/main.php';
const LEGACY_REQUESTED_PAGE = '/emerald/main.php';

$postFields = http_build_query([
    'txtusername' => $username,
    'txtPassword' => $password,
    'requestedPage' => LEGACY_REQUESTED_PAGE,
]);

$ch = curl_init(LEGACY_LOGIN_URL);
curl_setopt_array($ch, [
    CURLOPT_POST => true,
    CURLOPT_POSTFIELDS => $postFields,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HEADER => true,
    CURLOPT_FOLLOWLOCATION => false, // inspect the redirect ourselves
    CURLOPT_TIMEOUT => 15,
    CURLOPT_SSL_VERIFYPEER => true,
]);
$raw = curl_exec($ch);
$curlError = curl_error($ch);
$httpStatus = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$headerSize = curl_getinfo($ch, CURLINFO_HEADER_SIZE);
curl_close($ch);

if ($raw === false) {
    error_log("login.php proxy: curl failed: {$curlError}");
    respond(502, ['ok' => false, 'message' => 'Could not reach the login service.']);
}

$rawHeaders = substr($raw, 0, $headerSize);
$body = substr($raw, $headerSize);

// Success: the legacy app redirects away from the login page and sets a
// session cookie.
if ($httpStatus >= 300 && $httpStatus < 400) {
    $location = '';
    if (preg_match('/^Location:\s*(.+)$/mi', $rawHeaders, $m)) {
        $location = trim($m[1]);
    }
    $legacySessionId = '';
    if (preg_match('/^Set-Cookie:\s*PHPSESSID=([^;]+)/mi', $rawHeaders, $m)) {
        $legacySessionId = $m[1];
    }

    if ($location === '' || str_contains($location, 'resetpassword.php')) {
        respond(403, ['ok' => false, 'message' => 'Your password needs to be reset before you can sign in.']);
    }

    // Our "token" IS the legacy PHPSESSID — pass it back to the browser as
    // an httpOnly cookie scoped to this API host, and also return it so the
    // frontend can send it as a bearer token to other endpoints if needed.
    if ($legacySessionId !== '') {
        setcookie('x2p_session', $legacySessionId, [
            'expires' => time() + 60 * 60 * 8,
            'path' => '/',
            'secure' => true,
            'httponly' => true,
            'samesite' => 'Lax',
        ]);
    }

    respond(200, [
        'ok' => true,
        'token' => $legacySessionId ?: bin2hex(random_bytes(16)),
        'user' => [
            'name' => $username,
            'title' => '',
            'entity' => '',
            'department' => '',
            'role' => 'employee',
        ],
    ]);
}

// Failure: the legacy app re-renders the login page with an error message.
$message = 'Incorrect username or password.';
if (preg_match('/<div[^>]*id="txterror"[^>]*>(.*?)<\/div>/is', $body, $m)) {
    $errorText = trim(strip_tags($m[1]));
    if ($errorText !== '') {
        $message = $errorText;
    }
}

respond(401, ['ok' => false, 'message' => $message]);

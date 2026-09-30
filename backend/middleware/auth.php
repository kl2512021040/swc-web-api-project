<?php
function getAuthHeader() {
    $headers = null;
    if (isset($_SERVER['Authorization'])) {
        $headers = trim($_SERVER["Authorization"]);
    } else if (isset($_SERVER['HTTP_AUTHORIZATION'])) {
        $headers = trim($_SERVER["HTTP_AUTHORIZATION"]);
    } else if (function_exists('apache_request_headers')) {
        $requestHeaders = apache_request_headers();
        $requestHeaders = array_combine(array_map('ucwords', array_keys($requestHeaders)), array_values($requestHeaders));
        if (isset($requestHeaders['Authorization'])) {
            $headers = trim($requestHeaders['Authorization']);
        }
    }
    return $headers;
}

function verifySimpleAuth($requiredRole = null) {
    $authHeader = getAuthHeader();
    if (!$authHeader || !preg_match('/Bearer\s(\d+)-(\w+)/', $authHeader, $matches)) {
        http_response_code(401);
        echo json_encode(["status" => "error", "message" => "Unauthorized access. Valid token/header required."]);
        exit();
    }

    $userId = $matches[1];
    $userRole = $matches[2];

    if ($requiredRole && strtolower($userRole) !== strtolower($requiredRole)) {
        http_response_code(403);
        echo json_encode(["status" => "error", "message" => "Forbidden. Access denied for role: " . $userRole]);
        exit();
    }

    return ["id" => $userId, "role" => $userRole];
}
?>
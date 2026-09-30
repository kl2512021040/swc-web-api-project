<?php
require_once __DIR__ . '/middleware/cors.php';
require_once __DIR__ . '/config/db.php';
require_once __DIR__ . '/controllers/UserController.php';
require_once __DIR__ . '/controllers/VenueController.php';
require_once __DIR__ . '/controllers/EventController.php';
require_once __DIR__ . '/controllers/BookingController.php';

$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$uriSegments = explode('/', trim($uri, '/'));

$resource = null;
$id = null;

foreach ($uriSegments as $key => $segment) {
    if (in_array($segment, ['users', 'venues', 'events', 'bookings'])) {
        $resource = $segment;
        if (isset($uriSegments[$key + 1]) && is_numeric($uriSegments[$key + 1])) {
            $id = (int)$uriSegments[$key + 1];
        }
        break;
    }
}

$requestMethod = $_SERVER['REQUEST_METHOD'];

switch ($resource) {
    case 'users':
        $controller = new UserController($conn);
        $controller->handleRequest($requestMethod, $id);
        break;
    case 'venues':
        $controller = new VenueController($conn);
        $controller->handleRequest($requestMethod, $id);
        break;
    case 'events':
        $controller = new EventController($conn);
        $controller->handleRequest($requestMethod, $id);
        break;
    case 'bookings':
        $controller = new BookingController($conn);
        $controller->handleRequest($requestMethod, $id);
        break;
    default:
        http_response_code(404);
        echo json_encode(["status" => "error", "message" => "Endpoint not found"]);
        break;
}
?>
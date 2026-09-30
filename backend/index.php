<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Dapatkan path URL dan bersihkan
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$uriSegments = explode('/', trim($uri, '/'));

// Cari segmen resource (users, venues, events, bookings)
$resource = '';
$id = null;

foreach ($uriSegments as $index => $segment) {
    if (in_array($segment, ['users', 'venues', 'events', 'bookings'])) {
        $resource = $segment;
        if (isset($uriSegments[$index + 1]) && is_numeric($uriSegments[$index + 1])) {
            $id = $uriSegments[$index + 1];
        }
        break;
    }
}

$method = $_SERVER['REQUEST_METHOD'];

switch ($resource) {
    case 'users':
        require_once __DIR__ . '/controllers/UserController.php';
        $controller = new UserController();
        if ($method === 'GET') {
            $controller->getUsers($id);
        } elseif ($method === 'POST') {
            $controller->handlePost();
        } elseif ($method === 'DELETE') {
            $controller->deleteUser($id);
        }
        break;

    case 'venues':
        require_once __DIR__ . '/controllers/VenueController.php';
        $controller = new VenueController();
        if ($method === 'GET') {
            $controller->getVenues($id);
        } elseif ($method === 'POST') {
            $controller->createVenue();
        } elseif ($method === 'DELETE') {
            $controller->deleteVenue($id);
        }
        break;

    case 'events':
        require_once __DIR__ . '/controllers/EventController.php';
        $controller = new EventController();
        if ($method === 'GET') {
            $controller->getEvents($id);
        } elseif ($method === 'POST') {
            $controller->createEvent();
        } elseif ($method === 'DELETE') {
            $controller->deleteEvent($id);
        }
        break;

    case 'bookings':
        require_once __DIR__ . '/controllers/BookingController.php';
        $controller = new BookingController();
        if ($method === 'GET') {
            $controller->getBookings($id);
        } elseif ($method === 'POST') {
            $controller->createBooking();
        } elseif ($method === 'PUT') {
            $controller->cancelBooking($id);
        }
        break;

    default:
        http_response_code(404);
        echo json_encode(["status" => "error", "message" => "Endpoint not found: " . $uri]);
        break;
}
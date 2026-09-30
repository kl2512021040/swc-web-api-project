<?php
require_once __DIR__ . '/../helpers/qrcode.php';

class BookingController {
    private $conn;

    public function __construct($db) {
        $this->conn = $db;
    }

    public function handleRequest($method, $id) {
        switch ($method) {
            case 'GET':
                if ($id) {
                    $this->getBookingById($id);
                } else {
                    $this->getAllBookings();
                }
                break;
            case 'POST':
                $data = json_decode(file_get_contents("php://input"), true);
                $this->createBooking($data);
                break;
            case 'PUT':
                $data = json_decode(file_get_contents("php://input"), true);
                $this->cancelBooking($id, $data);
                break;
            default:
                http_response_code(405);
                echo json_encode(["status" => "error", "message" => "Method not allowed"]);
                break;
        }
    }

    private function getAllBookings() {
        $userId = $_GET['user_id'] ?? null;
        $sql = "SELECT b.*, e.title as event_title, e.event_date, u.name as customer_name FROM bookings b JOIN events e ON b.event_id = e.id JOIN users u ON b.user_id = u.id";
        
        if ($userId) {
            $sql .= " WHERE b.user_id = :user_id";
            $stmt = $this->conn->prepare($sql);
            $stmt->execute([':user_id' => $userId]);
        } else {
            $stmt = $this->conn->prepare($sql);
            $stmt->execute();
        }

        $bookings = $stmt->fetchAll();
        foreach ($bookings as &$booking) {
            $booking['qr_code_url'] = generateTicketQRCode($booking['id']);
        }

        http_response_code(200);
        echo json_encode(["status" => "success", "data" => $bookings]);
    }

    private function getBookingById($id) {
        $stmt = $this->conn->prepare("SELECT b.*, e.title as event_title, e.event_date, u.name as customer_name FROM bookings b JOIN events e ON b.event_id = e.id JOIN users u ON b.user_id = u.id WHERE b.id = :id");
        $stmt->execute([':id' => $id]);
        $booking = $stmt->fetch();

        if ($booking) {
            $booking['qr_code_url'] = generateTicketQRCode($booking['id']);
            http_response_code(200);
            echo json_encode(["status" => "success", "data" => $booking]);
        } else {
            http_response_code(404);
            echo json_encode(["status" => "error", "message" => "Booking not found"]);
        }
    }

    private function createBooking($data) {
        if (empty($data['user_id']) || empty($data['event_id']) || empty($data['tickets_qty'])) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Missing required booking details"]);
            return;
        }

        $stmt = $this->conn->prepare("SELECT ticket_price, available_tickets FROM events WHERE id = :id");
        $stmt->execute([':id' => $data['event_id']]);
        $event = $stmt->fetch();

        if (!$event || $event['available_tickets'] < $data['tickets_qty']) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Not enough tickets available"]);
            return;
        }

        $totalPrice = $event['ticket_price'] * $data['tickets_qty'];

        $this->conn->beginTransaction();
        try {
            $stmtBooking = $this->conn->prepare("INSERT INTO bookings (user_id, event_id, tickets_qty, total_price) VALUES (:user_id, :event_id, :tickets_qty, :total_price)");
            $stmtBooking->execute([
                ':user_id' => $data['user_id'],
                ':event_id' => $data['event_id'],
                ':tickets_qty' => $data['tickets_qty'],
                ':total_price' => $totalPrice
            ]);
            $bookingId = $this->conn->lastInsertId();

            $stmtUpdateEvent = $this->conn->prepare("UPDATE events SET available_tickets = available_tickets - :qty WHERE id = :id");
            $stmtUpdateEvent->execute([':qty' => $data['tickets_qty'], ':id' => $data['event_id']]);

            $this->conn->commit();

            http_response_code(201);
            echo json_encode([
                "status" => "success",
                "message" => "Booking confirmed",
                "booking_id" => $bookingId,
                "qr_code_url" => generateTicketQRCode($bookingId)
            ]);
        } catch (Exception $e) {
            $this->conn->rollBack();
            http_response_code(500);
            echo json_encode(["status" => "error", "message" => "Booking failed: " . $e->getMessage()]);
        }
    }

    private function cancelBooking($id, $data) {
        if (!$id) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Booking ID required"]);
            return;
        }

        $stmt = $this->conn->prepare("UPDATE bookings SET booking_status = 'Cancelled' WHERE id = :id");
        $stmt->execute([':id' => $id]);

        http_response_code(200);
        echo json_encode(["status" => "success", "message" => "Booking cancelled successfully"]);
    }
}
?>
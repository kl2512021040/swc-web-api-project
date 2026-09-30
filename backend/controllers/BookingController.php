<?php
require_once __DIR__ . '/../config/db.php';

class BookingController {
    private $db;

    public function __construct() {
        $database = new Database();
        $this->db = $database->connect();
    }

    public function getBookings($id = null) {
        $userId = $_GET['user_id'] ?? null;

        if ($id) {
            $stmt = $this->db->prepare("
                SELECT b.*, e.title as event_title, e.event_date, u.name as customer_name 
                FROM bookings b 
                JOIN events e ON b.event_id = e.id 
                JOIN users u ON b.user_id = u.id 
                WHERE b.id = ?
            ");
            $stmt->execute([$id]);
            $booking = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($booking) {
                $qrData = urlencode("BOOKING-ID:" . $booking['id'] . "|USER:" . $booking['customer_name'] . "|EVENT:" . $booking['event_title']);
                $booking['qr_code_url'] = "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=" . $qrData;
                echo json_encode(["status" => "success", "data" => $booking]);
            } else {
                http_response_code(404);
                echo json_encode(["status" => "error", "message" => "Booking not found"]);
            }
        } elseif ($userId) {
            $stmt = $this->db->prepare("
                SELECT b.*, e.title as event_title, e.event_date 
                FROM bookings b 
                JOIN events e ON b.event_id = e.id 
                WHERE b.user_id = ? 
                ORDER BY b.id DESC
            ");
            $stmt->execute([$userId]);
            $bookings = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode(["status" => "success", "data" => $bookings]);
        } else {
            $stmt = $this->db->prepare("SELECT * FROM bookings ORDER BY id DESC");
            $stmt->execute();
            $bookings = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode(["status" => "success", "data" => $bookings]);
        }
    }

    public function createBooking() {
        $data = json_decode(file_get_contents("php://input"), true) ?? $_POST;

        $user_id = $data['user_id'] ?? null;
        $event_id = $data['event_id'] ?? null;
        $tickets_qty = $data['tickets_qty'] ?? 0;
        $total_price = $data['total_price'] ?? 0.00;

        if (!$user_id || !$event_id || $tickets_qty <= 0) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Maklumat tempahan tidak lengkap."]);
            return;
        }

        try {
            $this->db->beginTransaction();

            // Potong baki tiket dari acara
            $stmtEvent = $this->db->prepare("UPDATE events SET available_tickets = available_tickets - ? WHERE id = ? AND available_tickets >= ?");
            $stmtEvent->execute([$tickets_qty, $event_id, $tickets_qty]);

            if ($stmtEvent->rowCount() === 0) {
                $this->db->rollBack();
                http_response_code(400);
                echo json_encode(["status" => "error", "message" => "Baki tiket tidak mencukupi."]);
                return;
            }

            // Simpan tempahan
            $stmt = $this->db->prepare("INSERT INTO bookings (user_id, event_id, tickets_qty, total_price) VALUES (?, ?, ?, ?)");
            $stmt->execute([$user_id, $event_id, $tickets_qty, $total_price]);
            $bookingId = $this->db->lastInsertId();

            $this->db->commit();

            echo json_encode([
                "status" => "success",
                "message" => "Tempahan berjaya!",
                "id" => $bookingId
            ]);
        } catch (PDOException $e) {
            $this->db->rollBack();
            http_response_code(500);
            echo json_encode(["status" => "error", "message" => "Gagal memproses tempahan."]);
        }
    }

    public function cancelBooking($id) {
        if (!$id) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "ID Tempahan diperlukan."]);
            return;
        }

        try {
            $stmt = $this->db->prepare("UPDATE bookings SET booking_status = 'Cancelled' WHERE id = ?");
            $stmt->execute([$id]);

            echo json_encode([
                "status" => "success",
                "message" => "Tempahan berjaya dibatalkan."
            ]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["status" => "error", "message" => "Gagal membatalkan tempahan."]);
        }
    }
}
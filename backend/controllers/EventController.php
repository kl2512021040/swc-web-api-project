<?php
require_once __DIR__ . '/../config/db.php';

class EventController {
    private $db;

    public function __construct() {
        $database = new Database();
        $this->db = $database->connect();
    }

    // GET /events atau GET /events/{id}
    public function getEvents($id = null) {
        if ($id) {
            $stmt = $this->db->prepare("
                SELECT e.*, v.name as venue_name, v.location 
                FROM events e 
                JOIN venues v ON e.venue_id = v.id 
                WHERE e.id = ?
            ");
            $stmt->execute([$id]);
            $event = $stmt->fetch(PDO::FETCH_ASSOC);
            if ($event) {
                echo json_encode(["status" => "success", "data" => $event]);
            } else {
                http_response_code(404);
                echo json_encode(["status" => "error", "message" => "Event not found"]);
            }
        } else {
            $stmt = $this->db->prepare("
                SELECT e.*, v.name as venue_name, v.location 
                FROM events e 
                JOIN venues v ON e.venue_id = v.id 
                ORDER BY e.event_date ASC
            ");
            $stmt->execute();
            $events = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode(["status" => "success", "data" => $events]);
        }
    }

    // POST /events
    public function createEvent() {
        $data = json_decode(file_get_contents("php://input"), true) ?? $_POST;

        $title = trim($data['title'] ?? '');
        $description = trim($data['description'] ?? '');
        $event_date = trim($data['event_date'] ?? '');
        $venue_id = $data['venue_id'] ?? null;
        $total_tickets = $data['total_tickets'] ?? 0;
        $ticket_price = $data['ticket_price'] ?? 0.00;
        $organiser_id = $data['organiser_id'] ?? 1;

        if (empty($title) || empty($event_date) || empty($venue_id) || empty($total_tickets)) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Sila isi semua ruangan wajib."]);
            return;
        }

        try {
            $stmt = $this->db->prepare("
                INSERT INTO events (title, description, event_date, venue_id, total_tickets, available_tickets, ticket_price, organiser_id) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ");
            $stmt->execute([
                $title, $description, $event_date, $venue_id, 
                $total_tickets, $total_tickets, $ticket_price, $organiser_id
            ]);

            echo json_encode([
                "status" => "success",
                "message" => "Acara berjaya diterbitkan!",
                "id" => $this->db->lastInsertId()
            ]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["status" => "error", "message" => "Gagal mencipta acara: " . $e->getMessage()]);
        }
    }

    // DELETE /events/{id}
    public function deleteEvent($id) {
        if (!$id) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "ID Acara diperlukan."]);
            return;
        }

        try {
            $stmt = $this->db->prepare("DELETE FROM events WHERE id = ?");
            $stmt->execute([$id]);

            echo json_encode([
                "status" => "success",
                "message" => "Acara berjaya dipadam."
            ]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["status" => "error", "message" => "Gagal memadam acara."]);
        }
    }
}
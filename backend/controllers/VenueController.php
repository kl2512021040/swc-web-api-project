<?php
require_once __DIR__ . '/../config/db.php';

class VenueController {
    private $db;

    public function __construct() {
        $database = new Database();
        $this->db = $database->connect();
    }

    // GET /venues atau GET /venues/{id}
    public function getVenues($id = null) {
        try {
            if ($id) {
                $stmt = $this->db->prepare("SELECT * FROM venues WHERE id = ?");
                $stmt->execute([$id]);
                $venue = $stmt->fetch(PDO::FETCH_ASSOC);
                if ($venue) {
                    echo json_encode(["status" => "success", "data" => $venue]);
                } else {
                    http_response_code(404);
                    echo json_encode(["status" => "error", "message" => "Venue not found"]);
                }
            } else {
                $stmt = $this->db->prepare("SELECT * FROM venues ORDER BY id DESC");
                $stmt->execute();
                $venues = $stmt->fetchAll(PDO::FETCH_ASSOC);
                echo json_encode(["status" => "success", "data" => $venues]);
            }
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["status" => "error", "message" => $e->getMessage()]);
        }
    }

    // POST /venues (Cipta Venue Baharu)
    public function createVenue() {
        $rawInput = file_get_contents("php://input");
        $data = json_decode($rawInput, true);

        if (!$data) {
            $data = $_POST;
        }

        $name = trim($data['name'] ?? '');
        $location = trim($data['location'] ?? '');
        $capacity = isset($data['capacity']) ? (int)$data['capacity'] : 0;
        $price = isset($data['price_per_day']) ? (float)$data['price_per_day'] : (isset($data['price']) ? (float)$data['price'] : 0.00);

        if (empty($name) || empty($location) || $capacity <= 0 || $price <= 0) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Sila isi semua maklumat venue dengan betul."]);
            return;
        }

        try {
            // Semak dahulu struktur column jadual venues di MySQL
            $columnsStmt = $this->db->query("SHOW COLUMNS FROM venues LIKE 'price_per_day'");
            $hasPricePerDay = $columnsStmt->fetch();

            if ($hasPricePerDay) {
                $stmt = $this->db->prepare("INSERT INTO venues (name, location, capacity, price_per_day) VALUES (?, ?, ?, ?)");
            } else {
                $stmt = $this->db->prepare("INSERT INTO venues (name, location, capacity, price) VALUES (?, ?, ?, ?)");
            }

            $stmt->execute([$name, $location, $capacity, $price]);

            http_response_code(201);
            echo json_encode([
                "status" => "success",
                "message" => "Venue baharu berjaya disimpan!",
                "id" => $this->db->lastInsertId()
            ]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["status" => "error", "message" => "Gagal simpan ke DB: " . $e->getMessage()]);
        }
    }

    // DELETE /venues/{id}
    public function deleteVenue($id) {
        if (!$id) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Venue ID is required"]);
            return;
        }

        try {
            $stmt = $this->db->prepare("DELETE FROM venues WHERE id = ?");
            $stmt->execute([$id]);

            echo json_encode([
                "status" => "success",
                "message" => "Venue deleted successfully"
            ]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["status" => "error", "message" => "Failed to delete venue"]);
        }
    }
}
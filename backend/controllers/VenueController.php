<?php
require_once __DIR__ . '/../config/db.php';

class VenueController {
    private $db;

    public function __construct() {
        $database = new Database();
        $this->db = $database->connect();
    }

    public function getVenues($id = null) {
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
    }

    public function createVenue() {
        $data = json_decode(file_get_contents("php://input"), true) ?? $_POST;

        $name = trim($data['name'] ?? '');
        $location = trim($data['location'] ?? '');
        $capacity = $data['capacity'] ?? 0;
        $price_per_day = $data['price_per_day'] ?? 0.00;

        if (empty($name) || empty($location) || empty($capacity) || empty($price_per_day)) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "All fields are required"]);
            return;
        }

        try {
            $stmt = $this->db->prepare("INSERT INTO venues (name, location, capacity, price_per_day) VALUES (?, ?, ?, ?)");
            $stmt->execute([$name, $location, $capacity, $price_per_day]);

            echo json_encode([
                "status" => "success",
                "message" => "Venue created successfully",
                "id" => $this->db->lastInsertId()
            ]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["status" => "error", "message" => "Failed to create venue"]);
        }
    }

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
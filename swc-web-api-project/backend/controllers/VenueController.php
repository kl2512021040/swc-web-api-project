<?php
class VenueController {
    private $conn;

    public function __construct($db) {
        $this->conn = $db;
    }

    public function handleRequest($method, $id) {
        switch ($method) {
            case 'GET':
                if ($id) {
                    $this->getVenueById($id);
                } else {
                    $this->getAllVenues();
                }
                break;
            case 'POST':
                $data = json_decode(file_get_contents("php://input"), true);
                $this->createVenue($data);
                break;
            case 'PUT':
                $data = json_decode(file_get_contents("php://input"), true);
                $this->updateVenue($id, $data);
                break;
            case 'DELETE':
                $this->deleteVenue($id);
                break;
            default:
                http_response_code(405);
                echo json_encode(["status" => "error", "message" => "Method not allowed"]);
                break;
        }
    }

    private function getAllVenues() {
        $stmt = $this->conn->prepare("SELECT * FROM venues");
        $stmt->execute();
        http_response_code(200);
        echo json_encode(["status" => "success", "data" => $stmt->fetchAll()]);
    }

    private function getVenueById($id) {
        $stmt = $this->conn->prepare("SELECT * FROM venues WHERE id = :id");
        $stmt->execute([':id' => $id]);
        $venue = $stmt->fetch();
        if ($venue) {
            http_response_code(200);
            echo json_encode(["status" => "success", "data" => $venue]);
        } else {
            http_response_code(404);
            echo json_encode(["status" => "error", "message" => "Venue not found"]);
        }
    }

    private function createVenue($data) {
        if (empty($data['name']) || empty($data['location']) || empty($data['capacity']) || empty($data['price_per_day'])) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "All fields are required"]);
            return;
        }

        $stmt = $this->conn->prepare("INSERT INTO venues (name, location, capacity, price_per_day) VALUES (:name, :location, :capacity, :price)");
        $stmt->execute([
            ':name' => $data['name'],
            ':location' => $data['location'],
            ':capacity' => $data['capacity'],
            ':price' => $data['price_per_day']
        ]);

        http_response_code(201);
        echo json_encode(["status" => "success", "message" => "Venue created successfully", "id" => $this->conn->lastInsertId()]);
    }

    private function updateVenue($id, $data) {
        if (!$id) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Venue ID required"]);
            return;
        }

        $stmt = $this->conn->prepare("UPDATE venues SET name = :name, location = :location, capacity = :capacity, price_per_day = :price WHERE id = :id");
        $stmt->execute([
            ':name' => $data['name'],
            ':location' => $data['location'],
            ':capacity' => $data['capacity'],
            ':price' => $data['price_per_day'],
            ':id' => $id
        ]);

        http_response_code(200);
        echo json_encode(["status" => "success", "message" => "Venue updated successfully"]);
    }

    private function deleteVenue($id) {
        if (!$id) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Venue ID required"]);
            return;
        }

        $stmt = $this->conn->prepare("DELETE FROM venues WHERE id = :id");
        $stmt->execute([':id' => $id]);
        http_response_code(200);
        echo json_encode(["status" => "success", "message" => "Venue deleted successfully"]);
    }
}
?>
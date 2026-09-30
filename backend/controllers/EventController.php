<?php
class EventController {
    private $conn;

    public function __construct($db) {
        $this->conn = $db;
    }

    public function handleRequest($method, $id) {
        switch ($method) {
            case 'GET':
                if ($id) {
                    $this->getEventById($id);
                } else {
                    $this->getAllEvents();
                }
                break;
            case 'POST':
                $data = json_decode(file_get_contents("php://input"), true);
                $this->createEvent($data);
                break;
            case 'PUT':
                $data = json_decode(file_get_contents("php://input"), true);
                $this->updateEvent($id, $data);
                break;
            case 'DELETE':
                $this->deleteEvent($id);
                break;
            default:
                http_response_code(405);
                echo json_encode(["status" => "error", "message" => "Method not allowed"]);
                break;
        }
    }

    private function getAllEvents() {
        $search = $_GET['search'] ?? '';
        $sql = "SELECT e.*, v.name as venue_name, v.location FROM events e JOIN venues v ON e.venue_id = v.id";
        
        if (!empty($search)) {
            $sql .= " WHERE e.title LIKE :search OR e.description LIKE :search";
            $stmt = $this->conn->prepare($sql);
            $stmt->execute([':search' => '%' . $search . '%']);
        } else {
            $stmt = $this->conn->prepare($sql);
            $stmt->execute();
        }

        http_response_code(200);
        echo json_encode(["status" => "success", "data" => $stmt->fetchAll()]);
    }

    private function getEventById($id) {
        $stmt = $this->conn->prepare("SELECT e.*, v.name as venue_name, v.location FROM events e JOIN venues v ON e.venue_id = v.id WHERE e.id = :id");
        $stmt->execute([':id' => $id]);
        $event = $stmt->fetch();

        if ($event) {
            http_response_code(200);
            echo json_encode(["status" => "success", "data" => $event]);
        } else {
            http_response_code(404);
            echo json_encode(["status" => "error", "message" => "Event not found"]);
        }
    }

    private function createEvent($data) {
        if (empty($data['title']) || empty($data['event_date']) || empty($data['venue_id']) || !isset($data['ticket_price']) || !isset($data['available_tickets']) || empty($data['organiser_id'])) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Missing required event fields"]);
            return;
        }

        $stmt = $this->conn->prepare("INSERT INTO events (title, description, event_date, venue_id, ticket_price, available_tickets, organiser_id) VALUES (:title, :description, :event_date, :venue_id, :ticket_price, :available_tickets, :organiser_id)");
        $stmt->execute([
            ':title' => $data['title'],
            ':description' => $data['description'] ?? '',
            ':event_date' => $data['event_date'],
            ':venue_id' => $data['venue_id'],
            ':ticket_price' => $data['ticket_price'],
            ':available_tickets' => $data['available_tickets'],
            ':organiser_id' => $data['organiser_id']
        ]);

        http_response_code(201);
        echo json_encode(["status" => "success", "message" => "Event created successfully", "id" => $this->conn->lastInsertId()]);
    }

    private function updateEvent($id, $data) {
        if (!$id) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Event ID required"]);
            return;
        }

        $stmt = $this->conn->prepare("UPDATE events SET title = :title, description = :description, event_date = :event_date, venue_id = :venue_id, ticket_price = :ticket_price, available_tickets = :available_tickets WHERE id = :id");
        $stmt->execute([
            ':title' => $data['title'],
            ':description' => $data['description'],
            ':event_date' => $data['event_date'],
            ':venue_id' => $data['venue_id'],
            ':ticket_price' => $data['ticket_price'],
            ':available_tickets' => $data['available_tickets'],
            ':id' => $id
        ]);

        http_response_code(200);
        echo json_encode(["status" => "success", "message" => "Event updated successfully"]);
    }

    private function deleteEvent($id) {
        if (!$id) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Event ID required"]);
            return;
        }

        $stmt = $this->conn->prepare("DELETE FROM events WHERE id = :id");
        $stmt->execute([':id' => $id]);
        http_response_code(200);
        echo json_encode(["status" => "success", "message" => "Event deleted successfully"]);
    }
}
?>
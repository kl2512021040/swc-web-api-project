<?php
class UserController {
    private $conn;

    public function __construct($db) {
        $this->conn = $db;
    }

    public function handleRequest($method, $id) {
        switch ($method) {
            case 'GET':
                if ($id) {
                    $this->getUserById($id);
                } else {
                    $this->getAllUsers();
                }
                break;
            case 'POST':
                $data = json_decode(file_get_contents("php://input"), true);
                if (isset($_GET['action']) && $_GET['action'] === 'login') {
                    $this->login($data);
                } else {
                    $this->createUser($data);
                }
                break;
            default:
                http_response_code(405);
                echo json_encode(["status" => "error", "message" => "Method not allowed"]);
                break;
        }
    }

    private function getAllUsers() {
        $stmt = $this->conn->prepare("SELECT id, name, email, role, created_at FROM users");
        $stmt->execute();
        $users = $stmt->fetchAll();
        http_response_code(200);
        echo json_encode(["status" => "success", "data" => $users]);
    }

    private function getUserById($id) {
        $stmt = $this->conn->prepare("SELECT id, name, email, role, created_at FROM users WHERE id = :id");
        $stmt->execute([':id' => $id]);
        $user = $stmt->fetch();

        if ($user) {
            http_response_code(200);
            echo json_encode(["status" => "success", "data" => $user]);
        } else {
            http_response_code(404);
            echo json_encode(["status" => "error", "message" => "User not found"]);
        }
    }

    private function createUser($data) {
        if (empty($data['name']) || empty($data['email']) || empty($data['password'])) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Missing required fields"]);
            return;
        }

        $hashedPassword = password_hash($data['password'], PASSWORD_BCRYPT);
        $role = $data['role'] ?? 'Customer';

        $stmt = $this->conn->prepare("INSERT INTO users (name, email, password, role) VALUES (:name, :email, :password, :role)");
        try {
            $stmt->execute([
                ':name' => $data['name'],
                ':email' => $data['email'],
                ':password' => $hashedPassword,
                ':role' => $role
            ]);
            http_response_code(201);
            echo json_encode(["status" => "success", "message" => "User registered successfully", "id" => $this->conn->lastInsertId()]);
        } catch (PDOException $e) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Email already exists or invalid data"]);
        }
    }

    private function login($data) {
        if (empty($data['email']) || empty($data['password'])) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Email and password required"]);
            return;
        }

        $stmt = $this->conn->prepare("SELECT * FROM users WHERE email = :email");
        $stmt->execute([':email' => $data['email']]);
        $user = $stmt->fetch();

        if ($user && password_verify($data['password'], $user['password'])) {
            $token = $user['id'] . "-" . $user['role'];
            http_response_code(200);
            echo json_encode([
                "status" => "success",
                "message" => "Login successful",
                "token" => $token,
                "user" => [
                    "id" => $user['id'],
                    "name" => $user['name'],
                    "email" => $user['email'],
                    "role" => $user['role']
                ]
            ]);
        } else {
            http_response_code(401);
            echo json_encode(["status" => "error", "message" => "Invalid credentials"]);
        }
    }
}
?>
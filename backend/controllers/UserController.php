<!DOCTYPE html>
<html lang="ms">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Portal Sistem Tempahan Tiket & Venue</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <style>
        body { background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%); min-height: 100vh; }
        .card { border-radius: 12px; }
    </style>
</head>
<body class="d-flex align-items-center justify-content-center py-5">
    <div class="container" style="max-width: 500px;">
        
        <div class="text-center text-white mb-4">
            <h2 class="fw-bold">Ticket & Venue Booking</h2>
            <p class="text-white-50">Satu Portal Utama Untuk Semua Pengguna</p>
        </div>

        <!-- LOG MASUK UTAMA -->
        <div class="card shadow-lg mb-4">
            <div class="card-header bg-dark text-white text-center py-3">
                <h5 class="mb-0 fw-semibold">LOG MASUK PENGGUNA</h5>
            </div>
            <div class="card-body p-4">
                <form id="mainLoginForm">
                    <div class="mb-3">
                        <label class="form-label fw-bold">Alamat E-mel</label>
                        <input type="email" id="loginEmail" class="form-control" placeholder="contoh: ameer@customer.com" required>
                    </div>
                    <div class="mb-3">
                        <label class="form-label fw-bold">Kata Laluan</label>
                        <input type="password" id="loginPassword" class="form-control" placeholder="123456" required>
                    </div>
                    <button type="submit" class="btn btn-primary w-100 py-2 fw-bold">Log Masuk Sistem</button>
                </form>
            </div>
        </div>

        <!-- DAFTAR PELANGGAN BAHARU -->
        <div class="card shadow-lg">
            <div class="card-header bg-success text-white text-center py-3">
                <h5 class="mb-0 fw-semibold">DAFTAR AKAUN PELANGGAN BAHARU</h5>
            </div>
            <div class="card-body p-4">
                <form id="mainRegisterForm">
                    <div class="mb-3">
                        <label class="form-label">Nama Penuh</label>
                        <input type="text" id="regName" class="form-control" placeholder="Ameer Hafiy" required>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">E-mel Baharu</label>
                        <input type="email" id="regEmail" class="form-control" placeholder="ameer2@customer.com" required>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Kata Laluan</label>
                        <input type="password" id="regPassword" class="form-control" placeholder="123456" required>
                    </div>
                    <input type="hidden" id="regRole" value="Customer">
                    <button type="submit" class="btn btn-success w-100 py-2 fw-bold">Daftar Sebagai Pelanggan</button>
                </form>
            </div>
        </div>

    </div>

    <script src="main.js"></script>
</body>
</html>
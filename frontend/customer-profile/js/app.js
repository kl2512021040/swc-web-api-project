const API_BASE = 'http://localhost/swc-web-api-project/backend/index.php';

// 1. Pengurusan Sesi & Sapaan Pengguna (Greeting Navbar)
function initSession() {
    const userData = localStorage.getItem('user');
    const greetingEl = document.getElementById('userGreeting');
    
    if (userData) {
        const user = JSON.parse(userData);
        if (greetingEl) {
            greetingEl.textContent = `Selamat datang, ${user.name}!`;
        }
        return user;
    } else {
        // Jika tiada sesi login, kembalikan ke homepage utama
        window.location.href = '../../index.html';
        return null;
    }
}

// 2. Fungsi Log Out Global
function logout() {
    if (confirm('Adakah anda pasti ingin log keluar?')) {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        window.location.href = '../../index.html';
    }
}

// 3. Memuatkan Tempahan Pelanggan yang Sedang Log In (Dinamik mengikut user.id)
async function loadMyBookings() {
    const tbody = document.getElementById('myBookings');
    if (!tbody) return;

    const user = initSession();
    if (!user) return;

    try {
        const res = await fetch(`${API_BASE}/bookings?user_id=${user.id}`);
        const json = await res.json();
        tbody.innerHTML = '';

        if (json.status === 'success' && json.data.length > 0) {
            json.data.forEach(b => {
                tbody.innerHTML += `
                    <tr>
                        <td>#${b.id}</td>
                        <td><strong>${b.event_title}</strong></td>
                        <td>${b.tickets_qty}</td>
                        <td>RM ${b.total_price}</td>
                        <td><span class="badge ${b.booking_status === 'Confirmed' ? 'bg-success' : 'bg-danger'}">${b.booking_status}</span></td>
                        <td><a href="ticket.html?id=${b.id}" class="btn btn-sm btn-info text-white">Lihat Kod QR</a></td>
                        <td>
                            ${b.booking_status === 'Confirmed' ? `<button onclick="cancelBooking(${b.id})" class="btn btn-sm btn-outline-danger">Batal</button>` : '-'}
                        </td>
                    </tr>
                `;
            });
        } else {
            tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted">Tiada rekod tempahan ditemui.</td></tr>';
        }
    } catch (err) {
        console.error('Error loading my bookings:', err);
    }
}

// 4. Membatalkan Tempahan Pelanggan
async function cancelBooking(id) {
    if (confirm('Adakah anda pasti ingin membatalkan tempahan ini?')) {
        try {
            await fetch(`${API_BASE}/bookings/${id}`, { method: 'PUT' });
            loadMyBookings();
        } catch (err) {
            console.error('Error canceling booking:', err);
        }
    }
}

// 5. Memuatkan Maklumat Tiket Digital & Gambar Kod QR daripada API
async function loadTicket() {
    const ticketInfo = document.getElementById('ticketInfo');
    if (!ticketInfo) return;

    const urlParams = new URLSearchParams(window.location.search);
    const bookingId = urlParams.get('id');

    if (bookingId) {
        try {
            const res = await fetch(`${API_BASE}/bookings/${bookingId}`);
            const json = await res.json();
            if (json.status === 'success') {
                const b = json.data;
                ticketInfo.innerHTML = `
                    <h5>${b.event_title}</h5>
                    <p class="mb-1"><strong>Pelanggan:</strong> ${b.customer_name}</p>
                    <p class="mb-1"><strong>Tarikh:</strong> ${b.event_date}</p>
                    <p class="mb-0"><strong>Kuantiti:</strong> ${b.tickets_qty} Tiket</p>
                `;
                const qrImg = document.getElementById('qrImage');
                if (qrImg) {
                    qrImg.src = b.qr_code_url;
                }
            }
        } catch (err) {
            console.error('Error loading ticket details:', err);
        }
    }
}

// Inisialisasi apabila dokumen selesai dimuatkan
document.addEventListener('DOMContentLoaded', () => {
    initSession();
    loadMyBookings();
    loadTicket();
});
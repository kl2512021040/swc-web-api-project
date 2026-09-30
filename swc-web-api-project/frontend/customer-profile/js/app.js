const API_BASE = 'http://localhost/swc-web-api-project/backend/index.php';

// Kendalikan Log Masuk (Login)
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const body = {
            email: document.getElementById('email').value.trim(),
            password: document.getElementById('password').value.trim()
        };

        try {
            const res = await fetch(`${API_BASE}/users?action=login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            const json = await res.json();
            if (res.ok && json.status === 'success') {
                localStorage.setItem('user', JSON.stringify(json.user));
                localStorage.setItem('token', json.token);
                alert('Log masuk berjaya!');
                window.location.href = 'my-bookings.html';
            } else {
                alert(json.message || 'Log masuk gagal.');
            }
        } catch (err) {
            console.error('Error logging in:', err);
            alert('Ralat sambungan ke pelayan.');
        }
    });
}

// Kendalikan Pendaftaran Akaun Baharu (Register)
const registerForm = document.getElementById('registerForm');
if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const body = {
            name: document.getElementById('regName').value.trim(),
            email: document.getElementById('regEmail').value.trim(),
            password: document.getElementById('regPassword').value.trim(),
            role: document.getElementById('regRole').value
        };

        try {
            const res = await fetch(`${API_BASE}/users`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            const json = await res.json();
            if (res.ok && json.status === 'success') {
                alert('Akaun berjaya didaftarkan! Sila log masuk menggunakan e-mel dan kata laluan anda.');
                registerForm.reset();
            } else {
                alert(json.message || 'Pendaftaran gagal.');
            }
        } catch (err) {
            console.error('Error registering:', err);
            alert('Ralat sambungan semasa pendaftaran.');
        }
    });
}

// Memuatkan senarai tempahan pelanggan
async function loadMyBookings() {
    const tbody = document.getElementById('myBookings');
    if (!tbody) return;

    try {
        const res = await fetch(`${API_BASE}/bookings?user_id=4`);
        const json = await res.json();
        tbody.innerHTML = '';

        if (json.status === 'success') {
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
        }
    } catch (err) {
        console.error('Error loading my bookings:', err);
    }
}

// Membatalkan tempahan
async function cancelBooking(id) {
    if (confirm('Batal tempahan ini?')) {
        await fetch(`${API_BASE}/bookings/${id}`, { method: 'PUT' });
        loadMyBookings();
    }
}

// Memuatkan maklumat tiket & Kod QR daripada API
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
                document.getElementById('qrImage').src = b.qr_code_url;
            }
        } catch (err) {
            console.error('Error loading ticket details:', err);
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadMyBookings();
    loadTicket();
});
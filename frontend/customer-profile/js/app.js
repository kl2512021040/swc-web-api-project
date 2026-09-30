const API_BASE = 'http://localhost/swc-web-api-project/backend/index.php';

function checkSession() {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
        window.location.href = '../../index.html';
        return null;
    }
    return JSON.parse(userStr);
}

function logout() {
    if (confirm('Adakah anda pasti ingin log keluar?')) {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        window.location.href = '../../index.html';
    }
}

async function loadMyBookings() {
    const tbody = document.getElementById('myBookings');
    if (!tbody) return;

    const user = checkSession();
    if (!user) return;

    try {
        const res = await fetch(`${API_BASE}/bookings?user_id=${user.id}`);
        const json = await res.json();
        tbody.innerHTML = '';

        if (json.status === 'success' && Array.isArray(json.data)) {
            if (json.data.length === 0) {
                tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted py-4">Anda belum membuat sebarang tempahan tiket.</td></tr>';
                return;
            }

            json.data.forEach(b => {
                const isConfirmed = b.booking_status === 'Confirmed';
                tbody.innerHTML += `
                    <tr>
                        <td>#${b.id}</td>
                        <td><strong>${b.event_title}</strong></td>
                        <td>${b.tickets_qty} Tiket</td>
                        <td>RM ${parseFloat(b.total_price).toFixed(2)}</td>
                        <td><span class="badge ${isConfirmed ? 'bg-success' : 'bg-danger'}">${b.booking_status}</span></td>
                        <td>
                            ${isConfirmed ? `<a href="ticket.html?id=${b.id}" class="btn btn-sm btn-info text-white fw-bold">Lihat Kod QR</a>` : '<span class="text-muted">-</span>'}
                        </td>
                        <td>
                            ${isConfirmed ? `<button onclick="cancelBooking(${b.id})" class="btn btn-sm btn-outline-danger">Batal</button>` : '<span class="text-muted">-</span>'}
                        </td>
                    </tr>
                `;
            });
        }
    } catch (err) {
        console.error('Error loading my bookings:', err);
    }
}

async function cancelBooking(id) {
    if (confirm('Adakah anda pasti ingin membatalkan tempahan ini?')) {
        try {
            const res = await fetch(`${API_BASE}/bookings/${id}`, { method: 'PUT' });
            const json = await res.json();

            if (res.ok && json.status === 'success') {
                alert('Tempahan berjaya dibatalkan.');
                loadMyBookings();
            } else {
                alert(json.message || 'Gagal membatalkan tempahan.');
            }
        } catch (err) {
            console.error('Error cancelling booking:', err);
        }
    }
}

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
                    <h5 class="fw-bold text-primary mb-2">${b.event_title}</h5>
                    <p class="mb-1"><strong>Nama Pelanggan:</strong> ${b.customer_name}</p>
                    <p class="mb-1"><strong>Tarikh Acara:</strong> ${b.event_date}</p>
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
    checkSession();
    loadMyBookings();
    loadTicket();
});
const API_BASE = 'http://localhost/swc-web-api-project/backend/index.php';

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

async function cancelBooking(id) {
    if (confirm('Batal tempahan ini?')) {
        await fetch(`${API_BASE}/bookings/${id}`, { method: 'PUT' });
        loadMyBookings();
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
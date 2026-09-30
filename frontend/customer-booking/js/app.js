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

// Memuatkan Senarai Acara untuk Pelanggan
async function loadCatalogEvents() {
    const eventsList = document.getElementById('eventsList');
    if (!eventsList) return;

    try {
        const res = await fetch(`${API_BASE}/events`);
        const json = await res.json();
        eventsList.innerHTML = '';

        if (json.status === 'success' && Array.isArray(json.data)) {
            if (json.data.length === 0) {
                eventsList.innerHTML = '<div class="col-12"><div class="alert alert-warning">Tiada acara tersedia buat masa ini.</div></div>';
                return;
            }

            json.data.forEach(e => {
                eventsList.innerHTML += `
                    <div class="col-md-4">
                        <div class="card h-100 shadow-sm">
                            <div class="card-body">
                                <h5 class="card-title fw-bold text-primary">${e.title}</h5>
                                <p class="card-text text-muted">${e.description || 'Tiada penerangan.'}</p>
                                <ul class="list-unstyled">
                                    <li><strong>Tarikh:</strong> ${e.event_date}</li>
                                    <li><strong>Venue:</strong> ${e.venue_name} (${e.location})</li>
                                    <li><strong>Harga:</strong> RM ${parseFloat(e.ticket_price).toFixed(2)}</li>
                                    <li><strong>Baki Tiket:</strong> <span class="badge bg-success">${e.available_tickets} Tiket</span></li>
                                </ul>
                                <div class="mt-3">
                                    <input type="number" id="qty_${e.id}" class="form-control mb-2" value="1" min="1" max="${e.available_tickets}">
                                    <button onclick="bookTicket(${e.id}, ${e.ticket_price})" class="btn btn-primary w-100 fw-bold">Tempah Sekarang</button>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            });
        }
    } catch (err) {
        console.error('Error loading catalog:', err);
    }
}

// Fungsi Membuat Tempahan
async function bookTicket(eventId, ticketPrice) {
    const user = checkSession();
    if (!user) return;

    const qtyInput = document.getElementById(`qty_${eventId}`);
    const ticketsQty = parseInt(qtyInput.value);

    if (ticketsQty <= 0) {
        alert('Sila masukkan kuantiti tiket yang sah.');
        return;
    }

    const body = {
        user_id: user.id,
        event_id: eventId,
        tickets_qty: ticketsQty,
        total_price: ticketsQty * ticketPrice
    };

    try {
        const res = await fetch(`${API_BASE}/bookings`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        const json = await res.json();

        if (res.ok && json.status === 'success') {
            alert('Tempahan berjaya dilakukan!');
            window.location.href = '../customer-profile/my-bookings.html';
        } else {
            alert(json.message || 'Gagal membuat tempahan.');
        }
    } catch (err) {
        console.error('Error booking ticket:', err);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    checkSession();
    loadCatalogEvents();
});
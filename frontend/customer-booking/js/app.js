const API_BASE = 'http://localhost/swc-web-api-project/backend/index.php';

// Semak Sesi Pelanggan
function checkSession() {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
        window.location.href = '../../index.html';
        return null;
    }
    return JSON.parse(userStr);
}

// Log Out
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
                eventsList.innerHTML = `
                    <div class="col-12">
                        <div class="alert alert-info text-center py-4">
                            <h5>Tiada Acara Tersedia</h5>
                            <p class="mb-0">Penganjur belum menerbitkan sebarang acara buat masa ini.</p>
                        </div>
                    </div>`;
                return;
            }

            json.data.forEach(e => {
                const isSoldOut = e.available_tickets <= 0;
                eventsList.innerHTML += `
                    <div class="col-md-4">
                        <div class="card h-100 shadow-sm border-0">
                            <div class="card-body d-flex flex-column">
                                <h5 class="card-title fw-bold text-primary">${e.title}</h5>
                                <p class="card-text text-muted small flex-grow-1">${e.description || 'Tiada penerangan acara.'}</p>
                                <hr>
                                <ul class="list-unstyled mb-3 small">
                                    <li class="mb-1"><strong>Tarikh:</strong> ${e.event_date}</li>
                                    <li class="mb-1"><strong>Venue:</strong> ${e.venue_name} (${e.location})</li>
                                    <li class="mb-1"><strong>Harga Tiket:</strong> <span class="fw-bold text-success">RM ${parseFloat(e.ticket_price).toFixed(2)}</span></li>
                                    <li class="mb-1"><strong>Baki Tiket:</strong> <span class="badge ${isSoldOut ? 'bg-danger' : 'bg-success'}">${isSoldOut ? 'Habis Dijual' : e.available_tickets + ' Tiket'}</span></li>
                                </ul>
                                <div class="mt-auto">
                                    ${isSoldOut ? `
                                        <button class="btn btn-secondary w-100 fw-bold" disabled>Habis Dijual</button>
                                    ` : `
                                        <div class="mb-2">
                                            <label class="form-label small fw-bold">Kuantiti Tiket:</label>
                                            <input type="number" id="qty_${e.id}" class="form-control" value="1" min="1" max="${e.available_tickets}">
                                        </div>
                                        <button onclick="bookTicket(${e.id},${e.ticket_price})" class="btn btn-primary w-100 fw-bold">Tempah Tiket</button>
                                    `}
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            });
        }
    } catch (err) {
        console.error('Error loading catalog:', err);
        eventsList.innerHTML = `
            <div class="col-12">
                <div class="alert alert-danger text-center">Gagal memuatkan senarai acara dari server.</div>
            </div>`;
    }
}

// Fungsi Memuatkan & Membuat Tempahan Tiket
async function bookTicket(eventId, ticketPrice) {
    const user = checkSession();
    if (!user) return;

    const qtyInput = document.getElementById(`qty_${eventId}`);
    const ticketsQty = parseInt(qtyInput.value);

    if (isNaN(ticketsQty) || ticketsQty <= 0) {
        alert('Sila masukkan kuantiti tiket yang sah.');
        return;
    }

    const totalPrice = ticketsQty * ticketPrice;

    if (!confirm(`Sahkan tempahan ${ticketsQty} tiket dengan jumlah RM ${totalPrice.toFixed(2)}?`)) {
        return;
    }

    const body = {
        user_id: user.id,
        event_id: eventId,
        tickets_qty: ticketsQty,
        total_price: totalPrice
    };

    try {
        const res = await fetch(`${API_BASE}/bookings`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        const json = await res.json();

        if (res.ok && json.status === 'success') {
            alert('Tempahan tiket berjaya dilakukan!');
            window.location.href = '../customer-profile/my-bookings.html';
        } else {
            alert(json.message || 'Gagal membuat tempahan.');
        }
    } catch (err) {
        console.error('Error booking ticket:', err);
        alert('Ralat sambungan ke server semasa membuat tempahan.');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    checkSession();
    loadCatalogEvents();
});
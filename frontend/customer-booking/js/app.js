const API_BASE = 'http://localhost/swc-web-api-project/backend/index.php';

async function fetchEvents(query = '') {
    const grid = document.getElementById('eventGrid');
    if (!grid) return;

    try {
        const res = await fetch(`${API_BASE}/events${query ? '?search=' + encodeURIComponent(query) : ''}`);
        const json = await res.json();
        grid.innerHTML = '';

        if (json.status === 'success') {
            json.data.forEach(e => {
                grid.innerHTML += `
                    <div class="col-md-4">
                        <div class="card h-100 shadow-sm">
                            <div class="card-body">
                                <h5 class="card-title text-primary">${e.title}</h5>
                                <p class="card-text text-muted mb-1">${e.description}</p>
                                <p class="mb-1"><strong>Tarikh:</strong> ${e.event_date}</p>
                                <p class="mb-1"><strong>Lokasi:</strong> ${e.venue_name}, ${e.location}</p>
                                <h6 class="mt-2 text-success">RM ${e.ticket_price}</h6>
                            </div>
                            <div class="card-footer bg-white border-top-0">
                                <a href="book.html?event_id=${e.id}" class="btn btn-outline-primary w-100">Tempah Tiket</a>
                            </div>
                        </div>
                    </div>
                `;
            });
        }
    } catch (err) {
        console.error('Error fetching events:', err);
    }
}

function searchEvents() {
    const q = document.getElementById('searchInput').value;
    fetchEvents(q);
}

async function loadEventForBooking() {
    const eventDetails = document.getElementById('eventDetails');
    if (!eventDetails) return;

    const urlParams = new URLSearchParams(window.location.search);
    const eventId = urlParams.get('event_id');

    if (eventId) {
        try {
            const res = await fetch(`${API_BASE}/events/${eventId}`);
            const json = await res.json();
            if (json.status === 'success') {
                const e = json.data;
                document.getElementById('eventId').value = e.id;
                eventDetails.innerHTML = `
                    <h5>${e.title}</h5>
                    <p class="mb-0">Harga: RM ${e.ticket_price} / tiket</p>
                `;
            }
        } catch (err) {
            console.error('Error loading event booking details:', err);
        }
    }
}

const bookingForm = document.getElementById('bookingForm');
if (bookingForm) {
    bookingForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const body = {
            user_id: 3,
            event_id: document.getElementById('eventId').value,
            tickets_qty: document.getElementById('qty').value
        };

        const res = await fetch(`${API_BASE}/bookings`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        const json = await res.json();
        if (res.ok) {
            alert('Tempahan Berjaya!');
            window.location.href = '../customer-profile/my-bookings.html';
        } else {
            alert(json.message || 'Gagal membuat tempahan.');
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    fetchEvents();
    loadEventForBooking();
});
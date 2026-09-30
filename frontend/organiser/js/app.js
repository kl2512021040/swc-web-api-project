const API_BASE = 'http://localhost/swc-web-api-project/backend/index.php';

async function loadOrganiserEvents() {
    const tbody = document.getElementById('organiserEvents');
    if (!tbody) return;

    try {
        const res = await fetch(`${API_BASE}/events`);
        const json = await res.json();
        tbody.innerHTML = '';

        if (json.status === 'success') {
            json.data.forEach(e => {
                tbody.innerHTML += `
                    <tr>
                        <td>${e.id}</td>
                        <td><strong>${e.title}</strong></td>
                        <td>${e.event_date}</td>
                        <td>${e.venue_name}</td>
                        <td>RM ${e.ticket_price}</td>
                        <td><span class="badge bg-warning text-dark">${e.available_tickets}</span></td>
                        <td><button onclick="deleteEvent(${e.id})" class="btn btn-sm btn-outline-danger">Padam</button></td>
                    </tr>
                `;
            });
        }
    } catch (err) {
        console.error('Error loading organiser events:', err);
    }
}

async function loadVenueDropdown() {
    const select = document.getElementById('venue_id');
    if (!select) return;

    try {
        const res = await fetch(`${API_BASE}/venues`);
        const json = await res.json();
        select.innerHTML = '<option value="">-- Pilih Venue --</option>';

        if (json.status === 'success') {
            json.data.forEach(v => {
                select.innerHTML += `<option value="${v.id}">${v.name} (${v.location})</option>`;
            });
        }
    } catch (err) {
        console.error('Error loading dropdown venues:', err);
    }
}

const createEventForm = document.getElementById('createEventForm');
if (createEventForm) {
    createEventForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const body = {
            title: document.getElementById('title').value,
            description: document.getElementById('desc').value,
            event_date: document.getElementById('event_date').value,
            venue_id: document.getElementById('venue_id').value,
            ticket_price: document.getElementById('ticket_price').value,
            available_tickets: document.getElementById('available_tickets').value,
            organiser_id: 2
        };

        const res = await fetch(`${API_BASE}/events`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        if (res.ok) {
            alert('Acara berjaya dicipta!');
            window.location.href = 'index.html';
        }
    });
}

async function deleteEvent(id) {
    if (confirm('Padam acara ini?')) {
        await fetch(`${API_BASE}/events/${id}`, { method: 'DELETE' });
        loadOrganiserEvents();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadOrganiserEvents();
    loadVenueDropdown();
});
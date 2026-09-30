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

// 1. Memuatkan Dropdown Venue dari API Admin
async function loadVenueOptions() {
    const venueSelect = document.getElementById('eVenue');
    if (!venueSelect) return;

    try {
        const res = await fetch(`${API_BASE}/venues`);
        const json = await res.json();

        if (json.status === 'success' && Array.isArray(json.data)) {
            venueSelect.innerHTML = '<option value="">-- Pilih Venue --</option>';
            json.data.forEach(v => {
                venueSelect.innerHTML += `<option value="${v.id}">${v.name} (${v.location})</option>`;
            });
        } else {
            venueSelect.innerHTML = '<option value="">Tiada venue didapati dari Admin</option>';
        }
    } catch (err) {
        console.error('Error loading venue options:', err);
    }
}

// 2. Memuatkan Senarai Acara Aktif
async function loadEvents() {
    const eventsTableBody = document.getElementById('eventsTableBody');
    if (!eventsTableBody) return;

    try {
        const res = await fetch(`${API_BASE}/events`);
        const json = await res.json();
        eventsTableBody.innerHTML = '';

        if (json.status === 'success' && Array.isArray(json.data)) {
            if (json.data.length === 0) {
                eventsTableBody.innerHTML = '<tr><td colspan="7" class="text-center text-muted">Tiada acara diterbitkan lagi.</td></tr>';
                return;
            }

            json.data.forEach(e => {
                eventsTableBody.innerHTML += `
                    <tr>
                        <td>#${e.id}</td>
                        <td><strong>${e.title}</strong></td>
                        <td>${e.event_date}</td>
                        <td>${e.venue_name}</td>
                        <td><span class="badge bg-info text-dark">${e.available_tickets} / ${e.total_tickets}</span></td>
                        <td>RM ${parseFloat(e.ticket_price).toFixed(2)}</td>
                        <td>
                            <button onclick="deleteEvent(${e.id})" class="btn btn-danger btn-sm">Padam</button>
                        </td>
                    </tr>
                `;
            });
        }
    } catch (err) {
        console.error('Error loading events:', err);
    }
}

// 3. Handler Borang Tambah Acara Baharu
const addEventForm = document.getElementById('addEventForm');
if (addEventForm) {
    addEventForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const user = checkSession();
        const body = {
            title: document.getElementById('eTitle').value.trim(),
            description: document.getElementById('eDesc').value.trim(),
            event_date: document.getElementById('eDate').value,
            venue_id: document.getElementById('eVenue').value,
            total_tickets: parseInt(document.getElementById('eTickets').value),
            ticket_price: parseFloat(document.getElementById('ePrice').value),
            organiser_id: user ? user.id : 1
        };

        try {
            const res = await fetch(`${API_BASE}/events`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            const json = await res.json();

            if (res.ok && json.status === 'success') {
                alert('Acara berjaya diterbitkan!');
                addEventForm.reset();
                loadEvents();
            } else {
                alert(json.message || 'Gagal menerbitkan acara.');
            }
        } catch (err) {
            console.error('Error adding event:', err);
            alert('Ralat sambungan semasa menerbitkan acara.');
        }
    });
}

// 4. Padam Acara
async function deleteEvent(id) {
    if (confirm(`Adakah anda pasti ingin memadam acara ID #${id}?`)) {
        try {
            const res = await fetch(`${API_BASE}/events/${id}`, { method: 'DELETE' });
            const json = await res.json();

            if (res.ok && json.status === 'success') {
                alert('Acara berjaya dipadam.');
                loadEvents();
            } else {
                alert(json.message || 'Gagal memadam acara.');
            }
        } catch (err) {
            console.error('Error deleting event:', err);
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    checkSession();
    loadVenueOptions();
    loadEvents();
});
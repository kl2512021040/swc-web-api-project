const API_BASE = 'http://localhost/swc-web-api-project/backend/index.php';

async function loadUsers() {
    const userTableBody = document.getElementById('userTableBody');
    if (!userTableBody) return;

    try {
        const res = await fetch(`${API_BASE}/users`);
        const json = await res.json();
        userTableBody.innerHTML = '';

        if (json.status === 'success') {
            json.data.forEach(user => {
                userTableBody.innerHTML += `
                    <tr>
                        <td>${user.id}</td>
                        <td>${user.name}</td>
                        <td>${user.email}</td>
                        <td><span class="badge bg-info">${user.role}</span></td>
                    </tr>
                `;
            });
        }
    } catch (err) {
        console.error('Error loading users:', err);
    }
}

async function loadVenues() {
    const venueTable = document.getElementById('venueTable');
    if (!venueTable) return;

    try {
        const res = await fetch(`${API_BASE}/venues`);
        const json = await res.json();
        venueTable.innerHTML = '';

        if (json.status === 'success') {
            json.data.forEach(v => {
                venueTable.innerHTML += `
                    <tr>
                        <td>${v.id}</td>
                        <td>${v.name}</td>
                        <td>${v.location}</td>
                        <td>${v.capacity}</td>
                        <td>RM ${v.price_per_day}</td>
                        <td><button onclick="deleteVenue(${v.id})" class="btn btn-danger btn-sm">Padam</button></td>
                    </tr>
                `;
            });
        }
    } catch (err) {
        console.error('Error loading venues:', err);
    }
}

const addVenueForm = document.getElementById('addVenueForm');
if (addVenueForm) {
    addVenueForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const body = {
            name: document.getElementById('vName').value,
            location: document.getElementById('vLoc').value,
            capacity: document.getElementById('vCap').value,
            price_per_day: document.getElementById('vPrice').value
        };

        const res = await fetch(`${API_BASE}/venues`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        if (res.ok) {
            alert('Venue berjaya ditambah!');
            addVenueForm.reset();
            loadVenues();
        }
    });
}

async function deleteVenue(id) {
    if (confirm('Padam venue ini?')) {
        await fetch(`${API_BASE}/venues/${id}`, { method: 'DELETE' });
        loadVenues();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadUsers();
    loadVenues();
});
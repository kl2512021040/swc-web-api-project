const API_BASE = 'http://localhost/swc-web-api-project/backend/index.php';

// Fungsi Log Out
function logout() {
    if (confirm('Adakah anda pasti ingin log keluar?')) {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        window.location.href = '../../index.html';
    }
}

// 1. Memuatkan Senarai Pengguna
async function loadUsers() {
    const userTableBody = document.getElementById('userTableBody');
    if (!userTableBody) return;

    try {
        const res = await fetch(`${API_BASE}/users`);
        const json = await res.json();
        userTableBody.innerHTML = '';

        if (json.status === 'success' && Array.isArray(json.data)) {
            json.data.forEach(user => {
                userTableBody.innerHTML += `
                    <tr>
                        <td>${user.id}</td>
                        <td>${user.name}</td>
                        <td>${user.email}</td>
                        <td>
                            <span class="badge ${user.role === 'Admin' ? 'bg-danger' : user.role === 'Organiser' ? 'bg-warning text-dark' : 'bg-info'}">
                                ${user.role}
                            </span>
                        </td>
                        <td>
                            <button onclick="deleteUser(${user.id})" class="btn btn-danger btn-sm">Padam User</button>
                        </td>
                    </tr>
                `;
            });
        }
    } catch (err) {
        console.error('Error loading users:', err);
    }
}

// 2. Fungsi Padam User
async function deleteUser(id) {
    if (confirm(`Adakah anda pasti ingin memadam pengguna ID #${id}?`)) {
        try {
            const res = await fetch(`${API_BASE}/users/${id}`, { method: 'DELETE' });
            const json = await res.json();

            if (res.ok && json.status === 'success') {
                alert('Pengguna berjaya dipadam!');
                loadUsers();
            } else {
                alert(json.message || 'Gagal memadam pengguna.');
            }
        } catch (err) {
            console.error('Error deleting user:', err);
        }
    }
}

// 3. Form Register User oleh Admin
const adminCreateUserForm = document.getElementById('adminCreateUserForm');
if (adminCreateUserForm) {
    adminCreateUserForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const body = {
            name: document.getElementById('adminRegName').value.trim(),
            email: document.getElementById('adminRegEmail').value.trim(),
            password: document.getElementById('adminRegPassword').value.trim(),
            role: document.getElementById('adminRegRole').value
        };

        try {
            const res = await fetch(`${API_BASE}/users`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            const json = await res.json();
            if (res.ok && json.status === 'success') {
                alert(`Akaun berjaya dicipta sebagai ${body.role}!`);
                adminCreateUserForm.reset();
                loadUsers();
            } else {
                alert(json.message || 'Gagal mendaftar akaun.');
            }
        } catch (err) {
            console.error('Error creating user:', err);
        }
    });
}

// 4. Memuatkan Senarai Venue
async function loadVenues() {
    const venueTable = document.getElementById('venueTable');
    if (!venueTable) return;

    try {
        const res = await fetch(`${API_BASE}/venues`);
        const json = await res.json();
        venueTable.innerHTML = '';

        if (json.status === 'success' && Array.isArray(json.data)) {
            if (json.data.length === 0) {
                venueTable.innerHTML = '<tr><td colspan="6" class="text-center text-muted">Tiada venue terdaftar.</td></tr>';
                return;
            }

            json.data.forEach(v => {
                venueTable.innerHTML += `
                    <tr>
                        <td>#${v.id}</td>
                        <td><strong>${v.name}</strong></td>
                        <td>${v.location}</td>
                        <td>${v.capacity} orang</td>
                        <td>RM ${parseFloat(v.price_per_day).toFixed(2)}</td>
                        <td>
                            <button onclick="deleteVenue(${v.id})" class="btn btn-danger btn-sm">Padam</button>
                        </td>
                    </tr>
                `;
            });
        }
    } catch (err) {
        console.error('Error loading venues:', err);
    }
}

// 5. Borang Tambah Venue
const addVenueForm = document.getElementById('addVenueForm');
if (addVenueForm) {
    addVenueForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const body = {
            name: document.getElementById('vName').value.trim(),
            location: document.getElementById('vLoc').value.trim(),
            capacity: parseInt(document.getElementById('vCap').value),
            price_per_day: parseFloat(document.getElementById('vPrice').value)
        };

        try {
            const res = await fetch(`${API_BASE}/venues`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            const json = await res.json();

            if (res.ok && json.status === 'success') {
                alert('Venue baharu berjaya ditambah!');
                addVenueForm.reset();
                loadVenues();
            } else {
                alert(json.message || 'Gagal menambah venue.');
            }
        } catch (err) {
            console.error('Error adding venue:', err);
        }
    });
}

// 6. Padam Venue
async function deleteVenue(id) {
    if (confirm(`Padam venue ID #${id}?`)) {
        try {
            const res = await fetch(`${API_BASE}/venues/${id}`, { method: 'DELETE' });
            const json = await res.json();
            if (res.ok && json.status === 'success') {
                alert('Venue berjaya dipadam.');
                loadVenues();
            } else {
                alert(json.message || 'Gagal memadam venue.');
            }
        } catch (err) {
            console.error('Error deleting venue:', err);
        }
    }
}

// Jalankan fungsi memuatkan data apabila dokumen sedia
document.addEventListener('DOMContentLoaded', () => {
    loadUsers();
    loadVenues();
});
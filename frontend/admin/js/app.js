const API_BASE = 'http://localhost/swc-web-api-project/backend/index.php';

// Fungsi Menyemak Sesi (Pencegahan Double Login)
function checkSession() {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
        // Jika belum log masuk, kembalikan ke portal utama
        window.location.href = '../../index.html';
        return null;
    }
    return JSON.parse(userStr);
}

// Fungsi Log Out
function logout() {
    if (confirm('Adakah anda pasti ingin log keluar?')) {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        window.location.href = '../../index.html';
    }
}

// ================= USER MANAGEMENT ================= //
async function loadUsers() {
    const userTableBody = document.getElementById('userTableBody');
    if (!userTableBody) return; // Abaikan jika bukan di halaman index.html

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

// ================= VENUE MANAGEMENT ================= //
async function loadVenues() {
    const venueTable = document.getElementById('venueTable');
    if (!venueTable) return; // Abaikan jika bukan di halaman venues.html

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

// ================= INITIALIZATION ================= //
document.addEventListener('DOMContentLoaded', () => {
    checkSession(); // Semak sesi hanya sekali masa page loading
    loadUsers();    // Akan berfungsi jika ada elemen userTableBody (index.html)
    loadVenues();   // Akan berfungsi jika ada elemen venueTable (venues.html)
});
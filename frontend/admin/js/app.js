const API_BASE = 'http://localhost/swc-web-api-project/backend/index.php';

// Fungsi Log Out
function logout() {
    if (confirm('Adakah anda pasti ingin log keluar?')) {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        window.location.href = '../../index.html';
    }
}

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

async function deleteUser(id) {
    if (confirm(`Adakah anda pasti ingin memadam pengguna ID #${id}?`)) {
        try {
            const res = await fetch(`${API_BASE}/users/${id}`, {
                method: 'DELETE'
            });

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

document.addEventListener('DOMContentLoaded', () => {
    loadUsers();
});
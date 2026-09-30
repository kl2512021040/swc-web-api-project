const API_BASE = 'http://localhost/swc-web-api-project/backend/index.php';

// Kendalikan Log Masuk Utama & Pengahlian mengikut Role
const mainLoginForm = document.getElementById('mainLoginForm');
if (mainLoginForm) {
    mainLoginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value.trim();

        try {
            const res = await fetch(`${API_BASE}/users?action=login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const json = await res.json();

            if (res.ok && json.status === 'success') {
                // Simpan data maklumat pengguna dan token dalam LocalStorage
                localStorage.setItem('user', JSON.stringify(json.user));
                localStorage.setItem('token', json.token);

                const role = json.user.role;
                alert(`Log masuk berjaya! Selamat datang ${json.user.name} (${role})`);

                // Penghaluan Automatik Mengikut Role
                if (role === 'Admin') {
                    window.location.href = 'frontend/admin/index.html';
                } else if (role === 'Organiser') {
                    window.location.href = 'frontend/organiser/index.html';
                } else {
                    window.location.href = 'frontend/customer-profile/my-bookings.html';
                }
            } else {
                alert(json.message || 'E-mel atau kata laluan tidak sah.');
            }
        } catch (err) {
            console.error('Error logging in:', err);
            alert('Ralat sambungan ke pelayan backend.');
        }
    });
}

// Kendalikan Pendaftaran Pelanggan Baharu
const mainRegisterForm = document.getElementById('mainRegisterForm');
if (mainRegisterForm) {
    mainRegisterForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const body = {
            name: document.getElementById('regName').value.trim(),
            email: document.getElementById('regEmail').value.trim(),
            password: document.getElementById('regPassword').value.trim(),
            role: document.getElementById('regRole').value
        };

        try {
            const res = await fetch(`${API_BASE}/users`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            const json = await res.json();

            if (res.ok && json.status === 'success') {
                alert('Pendaftaran berjaya! Sila log masuk menggunakan e-mel dan kata laluan anda.');
                mainRegisterForm.reset();
            } else {
                alert(json.message || 'Pendaftaran gagal.');
            }
        } catch (err) {
            console.error('Error registering:', err);
            alert('Ralat sambungan semasa pendaftaran.');
        }
    });
}
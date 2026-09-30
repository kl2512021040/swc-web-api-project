// Tambahkan snippet ini ke dalam frontend/admin/js/app.js jika belum ada:

// Memuatkan senarai venue
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

// Borang Tambah Venue
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

// Padam Venue
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

// Inisialisasi Apabila Dokumen Dimuatkan
document.addEventListener('DOMContentLoaded', () => {
    loadUsers();
    loadVenues();
});
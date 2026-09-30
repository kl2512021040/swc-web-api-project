const API_BASE = 'http://localhost/swc-web-api-project/backend/index.php';

let rawEventsData = [];
let exchangeRates = { MYR: 1, USD: 0.23, EUR: 0.21, SGD: 0.31 }; // Default fallback rates

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

// 1. INTEGRASI API MATA WANG (ExchangeRate-API)
async function fetchExchangeRates() {
    try {
        const res = await fetch('https://open.er-api.com/v6/latest/MYR');
        const json = await res.json();
        if (json && json.rates) {
            exchangeRates = json.rates;
        }
    } catch (err) {
        console.warn('Gagal memuatkan pertukaran mata wang live, menggunakan kadar asas:', err);
    }
}

// 2. INTEGRASI API CUACA (wttr.in REST API - Percuma tanpa API key)
async function fetchWeather(location) {
    try {
        const res = await fetch(`https://wttr.in/${encodeURIComponent(location)}?format=j1`);
        const json = await res.json();
        const current = json.current_condition[0];
        const tempC = current.temp_C;
        const condition = current.weatherDesc[0].value;
        return `${tempC}°C, ${condition}`;
    } catch (err) {
        return 'Suhu Tropika (Cerah/Hujan Lenyap)';
    }
}

// 3. MEMUATKAN SENARAI ACARA & INTEGRASI DUA API
async function loadCatalogEvents() {
    const eventsList = document.getElementById('eventsList');
    if (!eventsList) return;

    await fetchExchangeRates();

    try {
        const res = await fetch(`${API_BASE}/events`);
        const json = await res.json();

        if (json.status === 'success' && Array.isArray(json.data)) {
            rawEventsData = json.data;

            if (rawEventsData.length === 0) {
                eventsList.innerHTML = `
                    <div class="col-12">
                        <div class="alert alert-info text-center py-4">
                            <h5>Tiada Acara Tersedia</h5>
                            <p class="mb-0">Penganjur belum menerbitkan sebarang acara buat masa ini.</p>
                        </div>
                    </div>`;
                return;
            }

            renderEvents();
        }
    } catch (err) {
        console.error('Error loading catalog:', err);
        eventsList.innerHTML = `
            <div class="col-12">
                <div class="alert alert-danger text-center">Gagal memuatkan senarai acara dari server.</div>
            </div>`;
    }
}

// 4. MEMAPARKAN KAD ACARA BERSAMA DATA CUACA & MATA WANG
async function renderEvents() {
    const eventsList = document.getElementById('eventsList');
    const selectedCurrency = document.getElementById('currencySelect').value;
    const rate = exchangeRates[selectedCurrency] || 1;

    let symbol = 'RM ';
    if (selectedCurrency === 'USD') symbol = '$ ';
    if (selectedCurrency === 'EUR') symbol = '€ ';
    if (selectedCurrency === 'SGD') symbol = 'S$ ';

    eventsList.innerHTML = '';

    for (const e of rawEventsData) {
        const isSoldOut = e.available_tickets <= 0;
        const convertedPrice = (parseFloat(e.ticket_price) * rate).toFixed(2);
        
        // Panggil API Cuaca secara dinamik berdasarkan lokasi venue
        const weatherInfo = await fetchWeather(e.location || 'Kuala Lumpur');

        eventsList.innerHTML += `
            <div class="col-md-4">
                <div class="card h-100 shadow-sm border-0">
                    <div class="card-body d-flex flex-column">
                        <div class="d-flex justify-content-between align-items-start mb-2">
                            <h5 class="card-title fw-bold text-primary mb-0">${e.title}</h5>
                            <span class="badge bg-warning text-dark fw-bold">🌤️ ${weatherInfo}</span>
                        </div>
                        <p class="card-text text-muted small flex-grow-1">${e.description || 'Tiada penerangan acara.'}</p>
                        <hr>
                        <ul class="list-unstyled mb-3 small">
                            <li class="mb-1"><strong>Tarikh:</strong> ${e.event_date}</li>
                            <li class="mb-1"><strong>Venue:</strong> ${e.venue_name} (${e.location})</li>
                            <li class="mb-1"><strong>Harga Tiket:</strong> <span class="fw-bold text-success">${symbol}${convertedPrice}</span> <span class="text-muted small">(${selectedCurrency})</span></li>
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
    }
}

// 5. TUKAR MATA WANG SECARA LIVE
function changeCurrency() {
    renderEvents();
}

// 6. BUAT TEMPAHAN TIKET
async function bookTicket(eventId, ticketPriceInMYR) {
    const user = checkSession();
    if (!user) return;

    const qtyInput = document.getElementById(`qty_${eventId}`);
    const ticketsQty = parseInt(qtyInput.value);

    if (isNaN(ticketsQty) || ticketsQty <= 0) {
        alert('Sila masukkan kuantiti tiket yang sah.');
        return;
    }

    const totalPrice = ticketsQty * ticketPriceInMYR;

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
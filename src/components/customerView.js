import { store } from '../state/store.js';
import { createOrder, cancelOrder } from '../state/actions.js';
import { calculateFare, calculateCo2Saved, validateDistance, MAX_DISTANCE_KM } from '../utils/calculator.js';
import { POPULAR_LOCATIONS } from '../utils/mockData.js';

export function renderCustomerView(container) {
  let distanceKm = 3.5;
  let weightKg = 1.0;
  let validationError = null;

  function update() {
    const { orders, riders } = store.getState();
    const activeOrder = orders.find(o => o.status !== 'delivered' && o.status !== 'cancelled');
    const assignedRider = activeOrder ? riders.find(r => r.id === activeOrder.assignedRiderId) : null;

    const fare = calculateFare(distanceKm);
    const co2 = calculateCo2Saved(distanceKm);
    const distCheck = validateDistance(distanceKm);

    container.innerHTML = `
      <div class="customer-grid">
        <section class="card" aria-labelledby="booking-heading">
          <h2 id="booking-heading" class="card-title">📦 Buat Pesanan Baru</h2>
          
          ${validationError ? `<div class="alert-box">${validationError}</div>` : ''}

          <form id="order-form">
            <div class="form-group">
              <label for="pickup-select">Titik Penjemputan</label>
              <select id="pickup-select" class="form-control" required>
                ${POPULAR_LOCATIONS.map((loc, idx) => `<option value="${loc}" ${idx === 0 ? 'selected' : ''}>${loc}</option>`).join('')}
              </select>
            </div>

            <div class="form-group">
              <label for="dropoff-select">Titik Pengantaran</label>
              <select id="dropoff-select" class="form-control" required>
                ${POPULAR_LOCATIONS.map((loc, idx) => `<option value="${loc}" ${idx === 1 ? 'selected' : ''}>${loc}</option>`).join('')}
              </select>
            </div>

            <div class="form-group">
              <label for="item-type">Jenis Barang (Maks 5 kg)</label>
              <select id="item-type" class="form-control">
                <option value="Dokumen / Surat Segel">Dokumen / Surat Resmi</option>
                <option value="Map Berkas Kantor">Map Berkas Kontrak</option>
                <option value="Paket Kecil / Sampel">Paket Kotak Ringan (&le; 5 kg)</option>
              </select>
            </div>

            <div class="form-group">
              <label for="distance-range">Simulasi Jarak: <strong id="dist-label">${distanceKm} km</strong></label>
              <input type="range" id="distance-range" class="form-control" min="0.5" max="12.0" step="0.5" value="${distanceKm}">
            </div>

            <div class="calc-summary-box">
              <div class="calc-row">
                <span>Batas Radius Sepeda</span>
                <span>${distCheck.isValid ? '✅ Dalam Radius Aman' : '❌ Melebihi Batas'}</span>
              </div>
              <div class="calc-row">
                <span>Estimasi Jarak</span>
                <span>${distanceKm} km</span>
              </div>
              <div class="calc-row">
                <span>Dampak Lingkungan</span>
                <span class="eco-pill">🌱 Hemat ~${co2}g CO₂</span>
              </div>
              <div class="calc-row total">
                <span>Total Tarif</span>
                <span>Rp ${fare.toLocaleString('id-ID')}</span>
              </div>
            </div>

            <button type="submit" class="btn-primary" ${!distCheck.isValid ? 'disabled' : ''}>
              ${distCheck.isValid ? '🚴‍♂️ Panggil Kurir Sepeda Sekarang' : `⚠️ Maksimal Jarak ${MAX_DISTANCE_KM} km`}
            </button>
          </form>
        </section>

        <section class="card" aria-labelledby="status-heading">
          <h2 id="status-heading" class="card-title">📍 Pelacakan Pesanan Aktif</h2>
          
          ${activeOrder ? `
            <div class="active-order-box">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
                <strong>${activeOrder.id}</strong>
                <span class="brand-badge">${activeOrder.status.toUpperCase()}</span>
              </div>
              <p style="font-size:0.9rem; color:var(--color-text-muted);">
                ${activeOrder.pickup} &rarr; ${activeOrder.dropoff} (${activeOrder.distanceKm} km)
              </p>

              <div class="stepper">
                <div class="step-item ${activeOrder.status === 'pending' ? 'active' : 'done'}">
                  <div class="step-circle">1</div>
                  <div>
                    <strong>Mencari Kurir Terdekat</strong>
                    <p style="font-size:0.8rem; color:var(--color-text-muted);">Pesanan masuk radar pesepeda kota</p>
                  </div>
                </div>
                <div class="step-item ${activeOrder.status === 'accepted' ? 'active' : (['picking_up', 'in_transit', 'delivered'].includes(activeOrder.status) ? 'done' : '')}">
                  <div class="step-circle">2</div>
                  <div>
                    <strong>Kurir Ditugaskan</strong>
                    <p style="font-size:0.8rem; color:var(--color-text-muted);">${assignedRider ? `${assignedRider.name} (${assignedRider.bikeType})` : 'Menunggu kurir mengambil'}</p>
                  </div>
                </div>
                <div class="step-item ${activeOrder.status === 'in_transit' ? 'active' : (activeOrder.status === 'delivered' ? 'done' : '')}">
                  <div class="step-circle">3</div>
                  <div>
                    <strong>Dalam Tas & Sedang Gowes</strong>
                    <p style="font-size:0.8rem; color:var(--color-text-muted);">Paket meluncur cepat bebas macet</p>
                  </div>
                </div>
                <div class="step-item ${activeOrder.status === 'delivered' ? 'done' : ''}">
                  <div class="step-circle">4</div>
                  <div>
                    <strong>Sampai di Tujuan</strong>
                    <p style="font-size:0.8rem; color:var(--color-text-muted);">Pengantaran selesai!</p>
                  </div>
                </div>
              </div>

              ${['pending', 'accepted'].includes(activeOrder.status) ? `
                <button id="btn-cancel-order" class="btn-primary" style="margin-top:1.5rem; background-color:transparent; border:1px solid var(--color-danger); color:var(--color-danger);">
                  Batalkan Pesanan
                </button>
              ` : ''}
            </div>
          ` : `
            <p style="color:var(--color-text-muted); text-align:center; padding:2rem 0;">
              Belum ada pesanan aktif. Buat pesanan baru untuk mencoba alur kurir sepeda.
            </p>
          `}
        </section>
      </div>
    `;

    const rangeInput = container.querySelector('#distance-range');
    if (rangeInput) {
      rangeInput.addEventListener('input', (e) => {
        distanceKm = parseFloat(e.target.value);
        validationError = null;
        update();
      });
    }

    const form = container.querySelector('#order-form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        try {
          const pickup = container.querySelector('#pickup-select').value;
          const dropoff = container.querySelector('#dropoff-select').value;
          const itemType = container.querySelector('#item-type').value;

          if (pickup === dropoff) {
            validationError = 'Titik jemput dan antar tidak boleh sama!';
            update();
            return;
          }

          createOrder({
            pickup,
            dropoff,
            itemType,
            distanceKm,
            weightKg,
            senderName: 'Pengguna Kantor',
            senderPhone: '0812-3344-5566'
          });
          validationError = null;
        } catch (err) {
          validationError = err.message;
          update();
        }
      });
    }

    const cancelBtn = container.querySelector('#btn-cancel-order');
    if (cancelBtn && activeOrder) {
      cancelBtn.addEventListener('click', () => {
        cancelOrder(activeOrder.id);
      });
    }
  }

  store.subscribe(update);
  update();
}

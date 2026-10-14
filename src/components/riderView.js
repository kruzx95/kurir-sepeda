import { store } from '../state/store.js';
import { acceptOrder, updateOrderMilestone, reportRiderIssue, setRiderOnline } from '../state/actions.js';

export function renderRiderView(container) {
  let selectedRiderId = 'RIDER-01';

  function update() {
    const { riders, orders } = store.getState();
    const currentRider = riders.find(r => r.id === selectedRiderId) || riders[0];
    const assignedOrder = orders.find(o => o.assignedRiderId === currentRider.id && o.status !== 'delivered' && o.status !== 'cancelled');
    const pendingOrders = orders.filter(o => o.status === 'pending');

    container.innerHTML = `
      <div class="rider-container">
        <!-- Rider Selector & Online Toggle -->
        <div class="card" style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem;">
          <div style="display:flex; align-items:center; gap:0.75rem;">
            <span style="font-size:2rem;">${currentRider.avatar}</span>
            <div>
              <select id="rider-select" class="form-control" style="font-weight:700;">
                ${riders.map(r => `<option value="${r.id}" ${r.id === currentRider.id ? 'selected' : ''}>${r.name} (${r.bikeType})</option>`).join('')}
              </select>
              <span style="font-size:0.8rem; color:var(--color-text-muted);">${currentRider.bikeType}</span>
            </div>
          </div>
          <button id="toggle-online-btn" class="btn-primary" style="width:auto; min-width:140px; background-color:${currentRider.isOnline ? 'var(--color-eco-green)' : 'var(--color-border)'}; color:white;">
            ${currentRider.isOnline ? '🟢 Siap Gowes' : '⚪ Istirahat'}
          </button>
        </div>

        <!-- HUD Odometer Harian -->
        <div class="rider-hud">
          <div class="hud-item">
            <div class="hud-value">${currentRider.totalKmToday} km</div>
            <div class="hud-label">Jarak Gowes Hari Ini</div>
          </div>
          <div class="hud-item">
            <div class="hud-value">${currentRider.deliveriesCount}</div>
            <div class="hud-label">Pengantaran Sukses</div>
          </div>
          <div class="hud-item">
            <div class="hud-value">Rp ${(currentRider.deliveriesCount * 22000).toLocaleString('id-ID')}</div>
            <div class="hud-label">Estimasi Komisi</div>
          </div>
        </div>

        <!-- Active Delivery Card OR Radar Available Orders -->
        ${assignedOrder ? `
          <div class="order-card priority">
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <span class="brand-badge">SEDANG MENJALANKAN ORDER</span>
              <strong style="color:var(--color-accent-yellow);">${assignedOrder.id}</strong>
            </div>

            <div style="margin:1rem 0;">
              <p><strong>Jemput:</strong> ${assignedOrder.pickup}</p>
              <p><strong>Antar:</strong> ${assignedOrder.dropoff}</p>
              <p><strong>Barang:</strong> ${assignedOrder.itemType} (${assignedOrder.distanceKm} km)</p>
            </div>

            ${assignedOrder.status === 'accepted' ? `
              <button id="btn-milestone-pickup" class="btn-action-large">
                📍 1. Tiba di Titik Jemput
              </button>
            ` : ''}

            ${assignedOrder.status === 'picking_up' ? `
              <button id="btn-milestone-transit" class="btn-action-large">
                🎒 2. Paket Masuk Tas & Mulai Gowes
              </button>
            ` : ''}

            ${assignedOrder.status === 'in_transit' ? `
              <button id="btn-milestone-delivered" class="btn-action-large" style="background-color:var(--color-eco-green); color:white;">
                🏁 3. Konfirmasi Pengiriman Selesai!
              </button>
            ` : ''}

            <button id="btn-report-issue" class="btn-issue">
              ⚠️ Laporkan Kendala / Ban Bocor
            </button>
          </div>
        ` : `
          <div class="card">
            <h2 class="card-title">📡 Radar Pesanan Masuk (${pendingOrders.length})</h2>
            ${!currentRider.isOnline ? `
              <p style="color:var(--color-text-muted); text-align:center; padding:1.5rem 0;">
                Status Anda sedang <strong>Istirahat (Offline)</strong>. Nyalakan status "Siap Gowes" untuk mendeteksi order.
              </p>
            ` : (pendingOrders.length > 0 ? `
              <div class="pending-list">
                ${pendingOrders.map(order => `
                  <div class="order-card">
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                      <strong style="color:var(--color-accent-amber);">${order.id}</strong>
                      <span class="eco-pill">🚴 ${order.distanceKm} km</span>
                    </div>
                    <div style="margin:0.75rem 0;">
                      <p><strong>Jemput:</strong> ${order.pickup}</p>
                      <p><strong>Antar:</strong> ${order.dropoff}</p>
                      <p><strong>Muatan:</strong> ${order.itemType} | Upah: <strong>Rp ${order.fare.toLocaleString('id-ID')}</strong></p>
                    </div>
                    <button class="btn-action-large btn-accept-order" data-order-id="${order.id}">
                      Ambil Order Ini ⚡
                    </button>
                  </div>
                `).join('')}
              </div>
            ` : `
              <p style="color:var(--color-text-muted); text-align:center; padding:2rem 0;">
                Belum ada pesanan masuk di radar. Tunggu pesanan dari Pemesan.
              </p>
            `)}
          </div>
        `}
      </div>
    `;

    // Event Listeners
    const riderSelect = container.querySelector('#rider-select');
    if (riderSelect) {
      riderSelect.addEventListener('change', (e) => {
        selectedRiderId = e.target.value;
        update();
      });
    }

    const toggleOnlineBtn = container.querySelector('#toggle-online-btn');
    if (toggleOnlineBtn) {
      toggleOnlineBtn.addEventListener('click', () => {
        setRiderOnline(currentRider.id, !currentRider.isOnline);
      });
    }

    container.querySelectorAll('.btn-accept-order').forEach(btn => {
      btn.addEventListener('click', () => {
        const orderId = btn.getAttribute('data-order-id');
        acceptOrder(currentRider.id, orderId);
      });
    });

    const btnPickup = container.querySelector('#btn-milestone-pickup');
    if (btnPickup && assignedOrder) {
      btnPickup.addEventListener('click', () => updateOrderMilestone(assignedOrder.id, 'picking_up'));
    }

    const btnTransit = container.querySelector('#btn-milestone-transit');
    if (btnTransit && assignedOrder) {
      btnTransit.addEventListener('click', () => updateOrderMilestone(assignedOrder.id, 'in_transit'));
    }

    const btnDelivered = container.querySelector('#btn-milestone-delivered');
    if (btnDelivered && assignedOrder) {
      btnDelivered.addEventListener('click', () => updateOrderMilestone(assignedOrder.id, 'delivered'));
    }

    const btnIssue = container.querySelector('#btn-report-issue');
    if (btnIssue && assignedOrder) {
      btnIssue.addEventListener('click', () => {
        if (confirm('Laporkan kendala di jalan? Order akan dikembalikan ke radar kurir lain.')) {
          reportRiderIssue(assignedOrder.id);
        }
      });
    }
  }

  store.subscribe(update);
  update();
}

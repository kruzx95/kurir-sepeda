import { store } from '../state/store.js';
import { reportRiderIssue } from '../state/actions.js';

export function renderAdminView(container) {
  function update() {
    const { orders, riders, metrics } = store.getState();
    const activeOrders = orders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled');
    const availableRiders = riders.filter(r => r.isOnline && r.status === 'available');

    container.innerHTML = `
      <div class="admin-container">
        <!-- KPI Ribbon -->
        <div class="kpi-ribbon">
          <div class="kpi-card">
            <div class="kpi-value">${activeOrders.length}</div>
            <div class="kpi-label">Pesanan Berlangsung</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-value">${availableRiders.length} / ${riders.length}</div>
            <div class="kpi-label">Kurir Siaga (Available)</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-value" style="color:var(--color-eco-green);">${metrics.totalCo2Saved}g</div>
            <div class="kpi-label">Total CO₂ Dihemat Kota</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-value">${metrics.completedOrders}</div>
            <div class="kpi-label">Pengantaran Berhasil</div>
          </div>
        </div>

        <!-- Live Orders Matrix -->
        <section class="card" aria-labelledby="orders-matrix-heading">
          <h2 id="orders-matrix-heading" class="card-title">📋 Matriks Seluruh Pesanan Kota</h2>
          ${orders.length > 0 ? `
            <div class="data-table-wrapper">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Rute (Jemput &rarr; Antar)</th>
                    <th>Jarak</th>
                    <th>Tarif</th>
                    <th>CO₂ Saved</th>
                    <th>Status</th>
                    <th>Kurir</th>
                    <th>Aksi Dispatcher</th>
                  </tr>
                </thead>
                <tbody>
                  ${orders.map(order => {
                    const rider = riders.find(r => r.id === order.assignedRiderId);
                    return `
                      <tr>
                        <td><strong>${order.id}</strong></td>
                        <td>${order.pickup} &rarr; ${order.dropoff}</td>
                        <td>${order.distanceKm} km</td>
                        <td>Rp ${order.fare.toLocaleString('id-ID')}</td>
                        <td>🌱 ${order.co2SavedGrams}g</td>
                        <td><span class="status-badge status-${order.status}">${order.status.toUpperCase()}</span></td>
                        <td>${rider ? `${rider.avatar} ${rider.name}` : '<em style="color:var(--color-text-muted);">Mencari...</em>'}</td>
                        <td>
                          ${['accepted', 'picking_up', 'in_transit'].includes(order.status) ? `
                            <button class="btn-dispatch-reassign" data-order-id="${order.id}" style="background:transparent; border:1px solid var(--color-danger); color:var(--color-danger); padding:0.25rem 0.5rem; border-radius:4px; cursor:pointer;">
                              Re-dispatch
                            </button>
                          ` : '-'}
                        </td>
                      </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>
            </div>
          ` : `
            <p style="color:var(--color-text-muted); text-align:center; padding:1.5rem 0;">
              Belum ada pesanan tercatat di dalam sistem.
            </p>
          `}
        </section>

        <!-- Fleet Monitor -->
        <section class="card" aria-labelledby="fleet-heading">
          <h2 id="fleet-heading" class="card-title">🚲 Status Armada Kurir Sepeda</h2>
          <div class="data-table-wrapper">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Kurir</th>
                  <th>Jenis Sepeda</th>
                  <th>Kontak</th>
                  <th>Status</th>
                  <th>Total KM Gowes Hari Ini</th>
                  <th>Trip Selesai</th>
                </tr>
              </thead>
              <tbody>
                ${riders.map(rider => `
                  <tr>
                    <td><strong>${rider.avatar} ${rider.name}</strong></td>
                    <td>${rider.bikeType}</td>
                    <td>${rider.phone}</td>
                    <td>
                      <span class="brand-badge" style="background:${rider.isOnline ? (rider.status === 'on_delivery' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(16, 185, 129, 0.2)') : 'rgba(100, 116, 139, 0.2)'}; color:${rider.isOnline ? (rider.status === 'on_delivery' ? '#60A5FA' : 'var(--color-eco-green)') : 'var(--color-text-muted)'};">
                        ${rider.isOnline ? (rider.status === 'on_delivery' ? 'GOWES ANTAR' : 'STANDBY') : 'OFFLINE'}
                      </span>
                    </td>
                    <td><strong>${rider.totalKmToday} km</strong></td>
                    <td>${rider.deliveriesCount} pengantaran</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    `;

    container.querySelectorAll('.btn-dispatch-reassign').forEach(btn => {
      btn.addEventListener('click', () => {
        const orderId = btn.getAttribute('data-order-id');
        if (confirm(`Alihkan order ${orderId} ke kurir lain?`)) {
          reportRiderIssue(orderId);
        }
      });
    });
  }

  store.subscribe(update);
  update();
}

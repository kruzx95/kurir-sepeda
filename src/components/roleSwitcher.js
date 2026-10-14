import { store } from '../state/store.js';
import { setRole } from '../state/actions.js';

export function renderRoleSwitcher(container) {
  function update() {
    const { activeRole, orders, riders } = store.getState();
    const pendingOrdersCount = orders.filter(o => o.status === 'pending').length;
    const activeRidersCount = riders.filter(r => r.isOnline).length;

    container.innerHTML = `
      <div class="role-dock" role="tablist" aria-label="Pilih Peran">
        <button class="role-btn ${activeRole === 'customer' ? 'active' : ''}" data-role="customer">
          <span class="role-icon">👤</span>
          <span class="role-label">Pemesan</span>
        </button>
        <button class="role-btn ${activeRole === 'rider' ? 'active' : ''}" data-role="rider">
          <span class="role-icon">🚴</span>
          <span class="role-label">Kurir Sepeda</span>
          ${pendingOrdersCount > 0 ? `<span class="badge-alert">${pendingOrdersCount}</span>` : ''}
        </button>
        <button class="role-btn ${activeRole === 'admin' ? 'active' : ''}" data-role="admin">
          <span class="role-icon">🏢</span>
          <span class="role-label">Dispatcher / Admin</span>
          <span class="badge-info">${activeRidersCount} Siap</span>
        </button>
      </div>
    `;

    container.querySelectorAll('.role-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const role = btn.getAttribute('data-role');
        setRole(role);
      });
    });
  }

  store.subscribe(update);
  update();
}

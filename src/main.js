import './styles/main.css';
import './styles/customer.css';
import './styles/rider.css';
import { store } from './state/store.js';
import { renderRoleSwitcher } from './components/roleSwitcher.js';
import { renderCustomerView } from './components/customerView.js';
import { renderRiderView } from './components/riderView.js';

const roleContainer = document.getElementById('role-switcher-container');
const viewContainer = document.getElementById('view-container');

renderRoleSwitcher(roleContainer);

function renderCurrentView() {
  const { activeRole } = store.getState();
  viewContainer.innerHTML = '';

  if (activeRole === 'customer') {
    renderCustomerView(viewContainer);
  } else if (activeRole === 'rider') {
    renderRiderView(viewContainer);
  } else if (activeRole === 'admin') {
    viewContainer.innerHTML = '<div class="card"><h2 class="card-title">🏢 Dispatcher Dashboard</h2><p style="color:var(--color-text-muted);">Sedang memuat dashboard Dispatcher...</p></div>';
  }
}

store.subscribe(renderCurrentView);
renderCurrentView();

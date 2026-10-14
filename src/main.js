import './styles/main.css';
import './styles/customer.css';
import './styles/rider.css';
import './styles/admin.css';
import { store } from './state/store.js';
import { renderRoleSwitcher } from './components/roleSwitcher.js';
import { renderCustomerView } from './components/customerView.js';
import { renderRiderView } from './components/riderView.js';
import { renderAdminView } from './components/adminView.js';

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
    renderAdminView(viewContainer);
  }
}

store.subscribe(renderCurrentView);
renderCurrentView();

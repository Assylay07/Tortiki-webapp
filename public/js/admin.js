const token = localStorage.getItem('tt_token');
const user = JSON.parse(localStorage.getItem('tt_user') || 'null');
const fmt = n => new Intl.NumberFormat('ru-RU').format(n) + ' ₸';

if (!token || !user || user.role !== 'admin') location.href = '/login.html';

document.getElementById('logoutBtn').onclick = () => { localStorage.removeItem('tt_token'); localStorage.removeItem('tt_user'); location.href='/login.html'; };

async function loadOrders() {
  const res = await fetch('/api/orders/admin/list', { headers:{ Authorization:`Bearer ${token}` } });
  const orders = await res.json();
  const box = document.getElementById('adminOrders');
  if (!res.ok) { box.innerHTML = '<p>Ошибка доступа</p>'; return; }
  if (!orders.length) { box.innerHTML = '<p class="small-note">Заказов пока нет.</p>'; return; }
  box.innerHTML = orders.map(o => `
    <div class="admin-card">
      <div class="admin-row"><strong>№${o.orderNumber}</strong><span>${new Date(o.createdAt).toLocaleString('ru-RU')}</span></div>
      <div class="admin-row"><span>${o.customer.name} • ${o.customer.phone}</span><strong>${fmt(o.total)}</strong></div>
      <div class="admin-items">${o.items.map(i => `${i.name} × ${i.quantity}${i.cakeText ? ' • надпись: ' + i.cakeText : ''}`).join('<br>')}</div>
      <div class="admin-items">${o.delivery.method} • ${o.delivery.address || 'самовывоз'} • ${o.delivery.date} ${o.delivery.time}<br>${o.payment.method} • ${o.delivery.comment || ''}</div>
      <div class="admin-row">
        <span>Статус:</span>
        <select class="status-select" onchange="updateStatus('${o._id}', this.value)">
          ${['новый','принят','готовится','готов','выдан','отменен'].map(s => `<option ${o.status===s?'selected':''}>${s}</option>`).join('')}
        </select>
      </div>
    </div>`).join('');
}

async function updateStatus(id, status) {
  await fetch(`/api/orders/admin/${id}/status`, { method:'PATCH', headers:{'Content-Type':'application/json', Authorization:`Bearer ${token}`}, body:JSON.stringify({status}) });
  loadOrders();
}

loadOrders();

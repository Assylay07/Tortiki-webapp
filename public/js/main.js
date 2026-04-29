const API = '';

let products = [];
let filtered = 'Все';
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let user = JSON.parse(localStorage.getItem('user')) || null;

let currentProduct = null;
let selectedSize = null;
let detailQty = 1;

const DELIVERY_FEE = 1000;
const WORK_START = '09:00';
const WORK_END = '23:00';
const MIN_PREP_HOURS = 3;

const formatPrice = n => `${n.toLocaleString('ru-RU')} ₸`;

function saveCart() {
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartCount();
}

function updateCartCount() {
  const count = document.getElementById('cartCount');
  if (count) {
    count.textContent = cart.reduce((s, i) => s + i.qty, 0);
  }
}

async function loadProducts() {
  const res = await fetch('/api/products');
  products = await res.json();
  renderProducts();
  updateCartCount();
}

function renderProducts() {
  const box = document.getElementById('products');
  if (!box) return;

  const list = filtered === 'Все'
    ? products
    : products.filter(p => p.category === filtered);

  box.innerHTML = list.map(p => `
    <article class="product-card" onclick="openProduct('${p._id}')">
      <img src="${p.image}" alt="${p.name}">
      <div class="product-info">
        <span class="category">${p.category}</span>
        <h3>${p.name}</h3>
        <p>${p.description}</p>
        <div class="price">от ${formatPrice(p.price)}</div>
      </div>
    </article>
  `).join('');
}

function filterProducts(cat) {
  filtered = cat;

  document.querySelectorAll('.filters button').forEach(btn => {
    btn.classList.remove('active');
    if (btn.textContent === cat) btn.classList.add('active');
  });

  renderProducts();
}

async function openProduct(id) {
  const res = await fetch(`/api/products/${id}`);
  currentProduct = await res.json();

  const sizeTitle = document.getElementById('sizeTitle');
  const cakeTextBlock = document.getElementById('cakeTextBlock');

  if (currentProduct.category === 'Круассаны') {
    sizeTitle.textContent = currentProduct.name === 'Круассан Классика'
      ? 'Выберите вкус'
      : 'Порция';

    cakeTextBlock.style.display = 'none';
    document.getElementById('cakeText').value = '';
  } else {
    sizeTitle.textContent = 'Размер торта';
    cakeTextBlock.style.display = 'block';
  }

  selectedSize = currentProduct.sizes[0];
  detailQty = 1;

  document.getElementById('detailImage').src = currentProduct.image;
  document.getElementById('detailName').textContent = currentProduct.name;
  document.getElementById('detailDescription').textContent = currentProduct.description;
  document.getElementById('detailComposition').textContent = currentProduct.composition;
  document.getElementById('detailBadge').textContent = currentProduct.isBestSeller ? 'Best seller' : currentProduct.category;
  document.getElementById('qty').textContent = detailQty;

  renderSizeOptions();
  updateDetailPrice();

  document.getElementById('productDetail').classList.remove('hidden');
  document.getElementById('productDetail').scrollIntoView({ behavior: 'smooth' });
}

function renderSizeOptions() {
  const box = document.getElementById('sizeOptions');

  box.innerHTML = currentProduct.sizes.map((s, index) => `
    <button class="size-option ${index === 0 ? 'active' : ''}" onclick="selectSize(${index})">
      <strong>${s.label}</strong>
      <span>${s.weight}</span>
      <p>${formatPrice(s.price)}</p>
    </button>
  `).join('');
}

function selectSize(index) {
  selectedSize = currentProduct.sizes[index];

  document.querySelectorAll('.size-option').forEach((btn, i) => {
    btn.classList.toggle('active', i === index);
  });

  updateDetailPrice();
}

function updateDetailPrice() {
  document.getElementById('detailPrice').textContent = formatPrice(selectedSize.price);
}

function changeQty(value) {
  detailQty += value;
  if (detailQty < 1) detailQty = 1;
  document.getElementById('qty').textContent = detailQty;
}

function closeProductDetail() {
  document.getElementById('productDetail').classList.add('hidden');
  document.getElementById('catalog').scrollIntoView({ behavior: 'smooth' });
}

function addDetailToCart() {
  const text = document.getElementById('cakeText').value.trim();

  cart.push({
    id: currentProduct._id,
    name: currentProduct.name,
    image: currentProduct.image,
    size: selectedSize.label,
    weight: selectedSize.weight,
    price: selectedSize.price,
    qty: detailQty,
    cakeText: text
  });

  saveCart();
  openCart();
}

function openCart() {
  renderCart();

  document.getElementById('overlay').classList.add('show');
  document.getElementById('cartDrawer').classList.add('open');

  const guestFields = document.getElementById('guestFields');
  if (guestFields) {
    guestFields.style.display = user ? 'none' : 'block';
  }
}

function closeCart() {
  document.getElementById('overlay').classList.remove('show');
  document.getElementById('cartDrawer').classList.remove('open');
}

function renderCart() {
  const box = document.getElementById('cartItems');
  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);

  const deliverySelect = document.getElementById('delivery');
  const delivery = deliverySelect ? deliverySelect.value : 'Самовывоз';

  const deliveryFee = delivery === 'Доставка по Талгару' && cart.length > 0 ? DELIVERY_FEE : 0;
  const total = subtotal + deliveryFee;

  if (cart.length === 0) {
    box.innerHTML = '<p>Корзина пока пустая.</p>';
  } else {
    box.innerHTML = cart.map((item, index) => `
      <div class="cart-item">
        <img src="${item.image}" alt="${item.name}">
        <div>
          <h4>${item.name}</h4>
          <p>${item.size} • ${item.weight}</p>
          ${item.cakeText ? `<p>Надпись: ${item.cakeText}</p>` : ''}
          <strong>${formatPrice(item.price)}</strong>

          <div class="cart-controls">
            <button onclick="changeCartQty(${index}, -1)">−</button>
            <span>${item.qty}</span>
            <button onclick="changeCartQty(${index}, 1)">+</button>
            <button onclick="removeCartItem(${index})">×</button>
          </div>
        </div>
      </div>
    `).join('');
  }

  document.getElementById('cartTotal').innerHTML = `
    ${formatPrice(total)}
    ${deliveryFee > 0 ? `<small style="display:block;font-size:14px;color:#7b6b5e;margin-top: 10px">Включая доставку: ${formatPrice(deliveryFee)}</small>` : ''}
  `;
}

function changeCartQty(index, value) {
  cart[index].qty += value;

  if (cart[index].qty < 1) {
    cart.splice(index, 1);
  }

  saveCart();
  renderCart();
}

function removeCartItem(index) {
  cart.splice(index, 1);
  saveCart();
  renderCart();
}

async function submitOrder() {
  if (cart.length === 0) {
    showNotice('error', 'Корзина пуста', 'Добавьте десерт в корзину, чтобы оформить заказ.');
    return;
  }

  let customer;

  if (user) {
    customer = {
      name: user.name || 'Клиент',
      phone: user.phone || 'Не указан',
      email: user.email || ''
    };
  } else {
    customer = {
      name: document.getElementById('guestName')?.value.trim(),
      phone: document.getElementById('guestPhone')?.value.trim(),
      email: document.getElementById('guestEmail')?.value.trim()
    };

    if (!customer.name || !customer.phone) {
      showNotice('error', 'Укажите имя и телефон', 'Эти данные нужны, чтобы мы могли подтвердить заказ.');
      return;
    }
  }

  const delivery = document.getElementById('delivery').value;
  const orderDate = document.getElementById('orderDate').value;
  const orderTime = document.getElementById('orderTime').value;
  const address = document.getElementById('address')?.value.trim() || '';

  if (!validateOrderDateTime()) {
    return;
  }

  if (delivery === 'Доставка по Талгару' && !address) {
    showNotice('error', 'Укажите адрес', 'Для доставки по Талгару необходимо указать полный адрес.');
    return;
  }

  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const deliveryFee = delivery === 'Доставка по Талгару' ? DELIVERY_FEE : 0;
  const total = subtotal + deliveryFee;

  const order = {
    userId: user ? user._id : null,
    customer,
    items: cart,
    subtotal,
    deliveryFee,
    total,
    payment: document.getElementById('payment').value,
    delivery,
    orderDate,
    orderTime,
    address,
    comment: document.getElementById('comment').value
  };

  try {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order)
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || 'Ошибка при оформлении заказа');
      return;
    }

    cart = [];
    saveCart();
    renderCart();

    if (order.payment === 'Kaspi') {
      window.open('https://kaspi.kz', '_blank');
    }

    showNotice('success', 'Заказ оформлен', 'Спасибо! Мы свяжемся с вами для подтверждения заказа.');
    closeCart();

  } catch (err) {
    alert('Ошибка соединения с сервером. Проверь, запущен ли npm start.');
    console.log(err);
  }
}

function openProfile() {
  renderProfile();
  document.getElementById('overlay').classList.add('show');
  document.getElementById('profileDrawer').classList.add('open');
}

function closeProfile() {
  document.getElementById('overlay').classList.remove('show');
  document.getElementById('profileDrawer').classList.remove('open');
}

function renderProfile() {
  const box = document.getElementById('profileContent');

  if (!user) {
    box.innerHTML = `
      <div class="auth-box" id="loginBox">
        <h3>Вход</h3>

        <label>Email</label>
        <input id="loginEmail" placeholder="Введите email">

        <label>Пароль</label>
        <div class="password-wrap">
          <input id="loginPassword" type="password" placeholder="Введите пароль">
          <span onclick="togglePassword('loginPassword')" class="show-btn">Показать</span>
        </div>

        <p class="forgot-link" onclick="forgotPassword()">Забыли пароль?</p>
        <div class="auth-error" id="loginError"></div>

        <button onclick="login()">Войти</button>

        <p class="switch-link" onclick="showRegister()">Нет аккаунта? Зарегистрироваться</p>
      </div>

      <div class="auth-box hidden" id="registerBox">
        <h3>Регистрация</h3>

        <label>Имя</label>
        <input id="regName" placeholder="Введите имя">

        <label>Телефон</label>
        <input id="regPhone" placeholder="+7...">

        <label>Email</label>
        <input id="regEmail" placeholder="Введите email">

        <label>Пароль</label>
        <div class="password-wrap">
          <input id="regPassword" type="password" placeholder="Введите пароль">
          <span onclick="togglePassword('regPassword')" class="show-btn">Показать</span>
        </div>

        <div class="auth-error" id="regError"></div>

        <button onclick="register()">Зарегистрироваться</button>

        <p class="switch-link" onclick="showLogin()">Уже есть аккаунт? Войти</p>
      </div>
    `;
    return;
  }

  box.innerHTML = `
    <div class="profile-user">
      <h3>${user.name}</h3>
      <p>${user.email}</p>
      <p>${user.phone}</p>
      <button onclick="logout()" class="checkout-btn">Выйти</button>
    </div>

    <div id="profileOrders"></div>
  `;

  if (user.role === 'admin') {
    loadAdminOrders();
  } else {
    loadMyOrders();
  }
}

function showRegister() {
  document.getElementById('loginBox').classList.add('hidden');
  document.getElementById('registerBox').classList.remove('hidden');
}

function showLogin() {
  document.getElementById('registerBox').classList.add('hidden');
  document.getElementById('loginBox').classList.remove('hidden');
}

function togglePassword(id) {
  const input = document.getElementById(id);
  const btn = input.parentElement.querySelector('.show-btn');

  if (input.type === 'password') {
    input.type = 'text';
    btn.textContent = 'Скрыть';
  } else {
    input.type = 'password';
    btn.textContent = 'Показать';
  }
}

function forgotPassword() {
  window.open('https://wa.me/77473924574?text=Здравствуйте! Я забыла пароль от аккаунта Tortiki.', '_blank');
}

async function register() {
  const name = document.getElementById('regName').value.trim();
  const phone = document.getElementById('regPhone').value.trim();
  const email = document.getElementById('regEmail').value.trim();
  const password = document.getElementById('regPassword').value.trim();
  const error = document.getElementById('regError');

  if (!name) {
    error.textContent = 'Введите имя';
    return;
  }

  if (!phone) {
    error.textContent = 'Введите номер телефона';
    return;
  }

  if (!email) {
    error.textContent = 'Введите email';
    return;
  }

  if (!password) {
    error.textContent = 'Введите пароль';
    return;
  }

  if (password.length < 6) {
    error.textContent = 'Пароль должен быть минимум 6 символов';
    return;
  }

  error.textContent = '';

  const res = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, phone, email, password })
  });

  const data = await res.json();

  if (!res.ok) {
    error.textContent = data.message || 'Ошибка регистрации';
    return;
  }

  user = data;
  localStorage.setItem('user', JSON.stringify(user));
  renderProfile();
}

async function login() {
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value.trim();
  const error = document.getElementById('loginError');

  if (!email) {
    error.textContent = 'Введите email';
    return;
  }

  if (!password) {
    error.textContent = 'Введите пароль';
    return;
  }

  error.textContent = '';

  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  const data = await res.json();

  if (!res.ok) {
    error.textContent = data.message || 'Неверный email или пароль';
    return;
  }

  user = data;
  localStorage.setItem('user', JSON.stringify(user));
  renderProfile();
}

function logout() {
  user = null;
  localStorage.removeItem('user');
  renderProfile();
}

async function loadMyOrders() {
  const res = await fetch(`/api/orders/my/${user._id}`);
  const orders = await res.json();
  const box = document.getElementById('profileOrders');

  if (orders.length === 0) {
    box.innerHTML = '<p>У вас пока нет заказов.</p>';
    return;
  }

  box.innerHTML = `
    <h3>Мои заказы</h3>
    ${orders.map(o => `
      <div class="order-card">
        <p><strong>Сумма:</strong> ${formatPrice(o.total)}</p>
        <p><strong>Оплата:</strong> ${o.payment}</p>
        <p><strong>Статус:</strong> <span class="status">${o.status}</span></p>
      </div>
    `).join('')}
  `;
}

async function loadAdminOrders() {
  const res = await fetch('/api/orders/admin/all');
  const orders = await res.json();
  const box = document.getElementById('profileOrders');

  if (orders.length === 0) {
    box.innerHTML = '<p>Пока нет заказов.</p>';
    return;
  }

  box.innerHTML = `
    <h3>Поступившие заказы</h3>
    ${orders.map(o => `
      <div class="admin-order">
        <p><strong>Клиент:</strong> ${o.customer.name}</p>
        <p><strong>Телефон:</strong> ${o.customer.phone}</p>
        <p><strong>Сумма:</strong> ${formatPrice(o.total)}</p>
        <p><strong>Доставка:</strong> ${o.delivery}</p>
        <p><strong>Адрес:</strong> ${o.address || '-'}</p>
        <p><strong>Оплата:</strong> ${o.payment}</p>
        <p><strong>Статус:</strong> ${o.status}</p>

        <select onchange="changeOrderStatus('${o._id}', this.value)">
          <option ${o.status === 'Новый' ? 'selected' : ''}>Новый</option>
          <option ${o.status === 'Принят' ? 'selected' : ''}>Принят</option>
          <option ${o.status === 'Готовится' ? 'selected' : ''}>Готовится</option>
          <option ${o.status === 'Готов' ? 'selected' : ''}>Готов</option>
          <option ${o.status === 'Выдан' ? 'selected' : ''}>Выдан</option>
          <option ${o.status === 'Отменён' ? 'selected' : ''}>Отменён</option>
        </select>
      </div>
    `).join('')}
  `;
}

async function changeOrderStatus(id, status) {
  await fetch(`/api/orders/admin/status/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status })
  });

  loadAdminOrders();
}

function toggleMenu() {
  document.getElementById('mobileMenu').classList.toggle('show');
}

const overlay = document.getElementById('overlay');

if (overlay) {
  overlay.addEventListener('click', () => {
    closeCart();
    closeProfile();
  });
}

loadProducts();

function toggleAddressField() {
  const delivery = document.getElementById('delivery').value;
  const addressBox = document.getElementById('addressBox');
  const pickupBox = document.getElementById('pickupBox');

  if (delivery === 'Доставка по Талгару') {
    addressBox.style.display = 'block';
    pickupBox.style.display = 'none';
  } else {
    addressBox.style.display = 'none';
    pickupBox.style.display = 'block';
  }

  renderCart();
}

function validateOrderDateTime() {
  const dateValue = document.getElementById('orderDate').value;
  const timeValue = document.getElementById('orderTime').value;

  if (!dateValue) {
    showNotice('error', 'Выберите дату', 'Пожалуйста, укажите дату получения заказа.');
    return false;
  }

  if (!timeValue) {
    showNotice('error', 'Выберите время', 'Пожалуйста, выберите удобное время с 09:00 до 23:00.');
    return false;
  }

  if (timeValue < WORK_START || timeValue > WORK_END) {
    showNotice('error', 'Выберите время', 'Пожалуйста, выберите удобное время с 09:00 до 23:00.');
    return false;
  }

  const selectedDateTime = new Date(`${dateValue}T${timeValue}`);
  const now = new Date();

  if (selectedDateTime < now) {
    showNotice('error', 'Дата недоступна', 'Нельзя выбрать прошедшую дату или время.');
    return false;
  }

  const minAllowedTime = new Date(now.getTime() + MIN_PREP_HOURS * 60 * 60 * 1000);

  if (selectedDateTime < minAllowedTime) {
    showNotice('error', 'Заказ нужно оформить минимум за 3 часа до выбранного времени.');
    return false;
  }

  return true;
}

function showNotice(type, title, text) {
  const toast = document.getElementById('toast');
  const icon = document.getElementById('toastIcon');
  const titleBox = document.getElementById('toastTitle');
  const textBox = document.getElementById('toastText');

  toast.className = `toast show ${type}`;
  icon.textContent = type === 'error' ? '!' : '✓';
  titleBox.textContent = title;
  textBox.textContent = text;

  setTimeout(() => {
    toast.className = 'toast';
  }, 3500);
}
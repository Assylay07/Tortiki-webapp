document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const f = new FormData(e.target);
  const res = await fetch('/api/auth/login', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ email:f.get('email'), password:f.get('password') }) });
  const data = await res.json();
  if (!res.ok) { document.getElementById('authMsg').textContent = data.message || 'Ошибка'; return; }
  localStorage.setItem('tt_token', data.token);
  localStorage.setItem('tt_user', JSON.stringify(data.user));
  location.href = data.user.role === 'admin' ? '/admin.html' : '/';
});

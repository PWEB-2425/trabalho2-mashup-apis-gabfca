const API_BASE = 'http://localhost:3000/api';

const regUsername = document.getElementById('regUsername');
const regPassword = document.getElementById('regPassword');
const registerBtn = document.getElementById('registerBtn');

const loginUsername = document.getElementById('loginUsername');
const loginPassword = document.getElementById('loginPassword');
const loginBtn = document.getElementById('loginBtn');

const authSection = document.getElementById('authSection');

const errorMsg = document.getElementById('errorMsg');
const successMsg = document.getElementById('successMsg');

function clearMessages() {
  errorMsg.textContent = '';
  successMsg.textContent = '';
}
function showError(msg) {
  errorMsg.textContent = msg;
  successMsg.textContent = '';
}
function showSuccess(msg) {
  successMsg.textContent = msg;
  errorMsg.textContent = '';
}
function setLoggedIn(username) {

  window.location.href = 'app.html';
}
function setLoggedOut() {
  authSection.style.display = 'block';
  clearMessages();
}

registerBtn.addEventListener('click', async () => {
  clearMessages();
  const username = regUsername.value.trim();
  const password = regPassword.value;

  if (!username || !password) {
    return showError('Username and password are required for registration.');
  }

  try {
    const res = await fetch(`${API_BASE}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();
    if (!res.ok) {
      return showError(data.error || 'Registration failed.');
    }

    showSuccess('Registration successful! Redirecting...');
    regUsername.value = '';
    regPassword.value = '';
    setTimeout(() => setLoggedIn(data.user.username), 500); 
  } catch (err) {
    showError('Network error during registration.');
  }
});

loginBtn.addEventListener('click', async () => {
  clearMessages();
  const username = loginUsername.value.trim();
  const password = loginPassword.value;

  if (!username || !password) {
    return showError('Username and password are required for login.');
  }

  try {
    const res = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();
    if (!res.ok) {
      return showError(data.error || 'Login failed.');
    }

    showSuccess('Login successful! Redirecting...');
    loginUsername.value = '';
    loginPassword.value = '';
    setTimeout(() => setLoggedIn(data.user.username), 500);
  } catch (err) {
    showError('Network error during login.');
  }
});

async function checkSession() {
  try {
    const res = await fetch(`${API_BASE}/session`, {
      method: 'GET',
      credentials: 'include',
    });
    if (res.ok) {
      const data = await res.json();
      if (data.user && data.user.username) {

        setLoggedIn(data.user.username);
      } else {
        setLoggedOut();
      }
    } else {
      setLoggedOut();
    }
  } catch {
    setLoggedOut();
  }
}

checkSession();
const API_BASE = `${window.location.origin}/api/v1`;

const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const registerMessage = document.getElementById('registerMessage');
const toggleLoginBtn = document.getElementById('toggle-login');
const toggleRegisterBtn = document.getElementById('toggle-register');
const loginSection = document.getElementById('loginSection');
const registerSection = document.getElementById('registerSection');

const setAuthCookie = (token) => {
  const secure = window.location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `auth_token=${token}; path=/; SameSite=Lax${secure}`;
};

const redirectByRole = (role, token) => {
  localStorage.setItem('authToken', token);
  if (role === 'admin') {
    localStorage.setItem('jwtTokenAdmin', token);
    localStorage.removeItem('jwtTokenVoter');
    setAuthCookie(token);
    window.location.replace(
      `${window.location.origin}/admin.html?Authorization=Bearer ${token}`,
    );
  } else {
    localStorage.setItem('jwtTokenVoter', token);
    localStorage.removeItem('jwtTokenAdmin');
    setAuthCookie(token);
    window.location.replace(
      `${window.location.origin}/index.html?Authorization=Bearer ${token}`,
    );
  }
};

loginForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const voter_id = document.getElementById('voter-id').value;
  const password = document.getElementById('password').value;
  fetch(`${API_BASE}/login`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ voterId: voter_id, password }),
  })
    .then((response) => {
      if (response.ok) {
        return response.json();
      }
      throw new Error('Login failed');
    })
    .then((data) => {
      redirectByRole(data.role, data.token);
    })
    .catch((error) => {
      console.error('Login failed:', error.message);
    });
});

registerForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const voterId = document.getElementById('register-voter-id').value;
  const password = document.getElementById('register-password').value;
  const role = document.getElementById('register-role').value;

  registerMessage.textContent = '';

  if (!voterId || !password) {
    registerMessage.textContent = 'Voter ID and password are required.';
    return;
  }

  fetch(`${API_BASE}/register`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ voterId, password, role }),
  })
    .then((response) => {
      if (response.ok) {
        return response.json();
      }
      if (response.status === 409) {
        throw new Error('Voter already exists');
      }
      throw new Error('Registration failed');
    })
    .then((data) => {
      localStorage.setItem('lastRegisteredVoterId', voterId);
      registerMessage.textContent = 'Registration successful! Redirecting...';
      setTimeout(() => redirectByRole(data.role, data.token), 1000);
    })
    .catch((error) => {
      registerMessage.textContent = error.message;
    });
});

const setActiveView = (view) => {
  if (view === 'login') {
    loginSection.classList.remove('hidden');
    registerSection.classList.add('hidden');
    toggleLoginBtn.classList.add('active');
    toggleRegisterBtn.classList.remove('active');
  } else {
    loginSection.classList.add('hidden');
    registerSection.classList.remove('hidden');
    toggleLoginBtn.classList.remove('active');
    toggleRegisterBtn.classList.add('active');
  }
};

toggleLoginBtn.addEventListener('click', () => setActiveView('login'));
toggleRegisterBtn.addEventListener('click', () => setActiveView('register'));

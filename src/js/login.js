const API_BASE = 'http://127.0.0.1:8080/api/v1';

const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const registerMessage = document.getElementById('registerMessage');

const redirectByRole = (role, token) => {
  if (role === 'admin') {
    localStorage.setItem('jwtTokenAdmin', token);
    window.location.replace(`http://127.0.0.1:8080/admin.html?Authorization=Bearer ${token}`);
  } else {
    localStorage.setItem('jwtTokenVoter', token);
    window.location.replace(`http://127.0.0.1:8080/index.html?Authorization=Bearer ${token}`);
  }
};

loginForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const voter_id = document.getElementById('voter-id').value;
  const password = document.getElementById('password').value;
  fetch(`${API_BASE}/login`, {
    method: 'POST',
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

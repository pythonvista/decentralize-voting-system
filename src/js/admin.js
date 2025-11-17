const API_BASE = `${window.location.origin}/api/v1`;

const getCookieValue = (name) => {
  const match = document.cookie
    .split(';')
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${name}=`));
  return match ? match.split('=')[1] : null;
};

const getQueryToken = () => {
  const params = new URLSearchParams(window.location.search);
  const raw = params.get('Authorization');
  if (!raw) return null;
  return raw.startsWith('Bearer ') ? raw.slice(7) : raw;
};

const token =
  getQueryToken() ||
  localStorage.getItem('jwtTokenAdmin') ||
  localStorage.getItem('authToken') ||
  getCookieValue('auth_token');
if (getQueryToken()) {
  const url = new URL(window.location.href);
  url.searchParams.delete('Authorization');
  window.history.replaceState({}, document.title, url.toString());
}

if (!token) {
  window.location.replace(`${window.location.origin}/`);
}

const candidateForm = document.getElementById('candidateForm');
const candidateNameInput = document.getElementById('candidate-name');
const candidatePartyInput = document.getElementById('candidate-party');
const candidateTableBody = document.getElementById('candidateTableBody');
const adminMessage = document.getElementById('adminMessage');
const logoutBtn = document.getElementById('logoutBtn');

const authHeaders = {
  Authorization: `Bearer ${token}`,
  'Content-Type': 'application/json',
};

const renderCandidates = (candidates = []) => {
  candidateTableBody.innerHTML = '';
  candidates.forEach((candidate) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${candidate.id}</td>
      <td>${candidate.name}</td>
      <td>${candidate.party}</td>
      <td>${candidate.votes ?? 0}</td>
    `;
    candidateTableBody.appendChild(row);
  });
};

const fetchCandidates = () => {
  fetch(`${API_BASE}/candidates`)
    .then((response) => response.json())
    .then((data) => {
      renderCandidates(data.candidates || []);
    })
    .catch((error) => {
      adminMessage.textContent = `Unable to load candidates: ${error.message}`;
    });
};

candidateForm.addEventListener('submit', (event) => {
  event.preventDefault();
  adminMessage.textContent = '';

  const name = candidateNameInput.value.trim();
  const party = candidatePartyInput.value.trim();

  if (!name || !party) {
    adminMessage.textContent = 'Name and party are required.';
    return;
  }

  fetch(`${API_BASE}/candidates`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({ name, party }),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error('Failed to add candidate');
      }
      candidateNameInput.value = '';
      candidatePartyInput.value = '';
      adminMessage.textContent = 'Candidate added successfully.';
      fetchCandidates();
    })
    .catch((error) => {
      adminMessage.textContent = error.message;
    });
});

logoutBtn.addEventListener('click', () => {
  localStorage.removeItem('jwtTokenAdmin');
  localStorage.removeItem('authToken');
  document.cookie = 'auth_token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;';
  window.location.replace(`${window.location.origin}/`);
});

fetchCandidates();


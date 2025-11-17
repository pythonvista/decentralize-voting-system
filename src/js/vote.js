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
  localStorage.getItem('jwtTokenVoter') ||
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

const candidateTableBody = document.getElementById('boxCandidate');
const voteButton = document.getElementById('voteButton');
const messageBox = document.getElementById('msg');
const logoutBtn = document.getElementById('logoutBtn');
let hasVoted = false;

const renderCandidates = (candidates = []) => {
  candidateTableBody.innerHTML = '';
  candidates.forEach((candidate) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>
        <input class="form-check-input" type="radio" name="candidate" value="${candidate.id}">
        ${candidate.name}
      </td>
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
      messageBox.textContent = `Unable to load candidates: ${error.message}`;
    });
};

const applyVoteState = () => {
  if (hasVoted) {
    voteButton.disabled = true;
    messageBox.textContent = 'You have already voted.';
  } else {
    voteButton.disabled = false;
  }
};

const fetchVoteStatus = () => {
  fetch(`${API_BASE}/vote/status`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error('Unable to retrieve vote status');
      }
      return response.json();
    })
    .then((data) => {
      hasVoted = Boolean(data.hasVoted);
      applyVoteState();
    })
    .catch((error) => {
      messageBox.textContent = error.message;
    });
};

voteButton.addEventListener('click', () => {
  const candidateId = document.querySelector(
    'input[name="candidate"]:checked',
  )?.value;

  messageBox.textContent = '';

  if (!candidateId) {
    messageBox.textContent = 'Please select a candidate.';
    return;
  }

  fetch(`${API_BASE}/vote`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ candidateId }),
  })
    .then((response) => {
      if (!response.ok) {
        if (response.status === 409) {
          throw new Error('You already voted.');
        }
        throw new Error('Failed to submit vote.');
      }
      return response.json();
    })
    .then(() => {
      hasVoted = true;
      alert('Vote recorded successfully.');
      messageBox.textContent = 'Vote recorded successfully.';
      applyVoteState();
      fetchCandidates();
    })
    .catch((error) => {
      messageBox.textContent = error.message;
    });
});

logoutBtn.addEventListener('click', () => {
  localStorage.removeItem('jwtTokenVoter');
  localStorage.removeItem('authToken');
  document.cookie = 'auth_token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;';
  window.location.replace(`${window.location.origin}/`);
});

fetchCandidates();
fetchVoteStatus();


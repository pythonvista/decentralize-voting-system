const fs = require('fs');
const path = require('path');

const candidates = [
  { id: 1, name: 'Alice Johnson', party: 'Unity', votes: 0 },
  { id: 2, name: 'Brian Smith', party: 'Prosperity', votes: 0 },
  { id: 3, name: 'Carla Gomez', party: 'Progress', votes: 0 },
];

const voterFilePath = path.join(__dirname, 'voters.json');

function loadAllowList() {
  try {
    const contents = fs.readFileSync(voterFilePath, 'utf-8');
    return JSON.parse(contents);
  } catch (error) {
    console.warn('Unable to load voters.json. Using empty allow list.');
    return [];
  }
}

let allowList = loadAllowList();

function persistAllowList() {
  fs.writeFileSync(voterFilePath, JSON.stringify(allowList, null, 2));
}

const voterLedger = new Map(); // voterId -> candidateId

function listCandidates() {
  return candidates.map(({ id, name, party }) => ({ id, name, party }));
}

function listResults() {
  return candidates.map(({ id, name, party, votes }) => ({
    id,
    name,
    party,
    votes,
  }));
}

function findCandidate(candidateId) {
  return candidates.find((candidate) => candidate.id === candidateId);
}

function hasVoted(voterId) {
  return voterLedger.has(voterId);
}

function recordVote(voterId, candidateId) {
  const candidate = findCandidate(candidateId);
  if (!candidate) {
    return null;
  }

  candidate.votes += 1;
  voterLedger.set(voterId, candidateId);
  return candidate;
}

function validateVoter(voterId, password) {
  return allowList.find(
    (entry) => entry.voterId === voterId && entry.password === password,
  );
}

function voterExists(voterId) {
  return allowList.some((entry) => entry.voterId === voterId);
}

function registerVoter(voterId, password, role = 'user') {
  if (voterExists(voterId)) {
    return null;
  }

  const newVoter = { voterId, password, role };
  allowList.push(newVoter);
  persistAllowList();
  return newVoter;
}

module.exports = {
  listCandidates,
  listResults,
  hasVoted,
  recordVote,
  findCandidate,
  validateVoter,
  registerVoter,
  voterExists,
};


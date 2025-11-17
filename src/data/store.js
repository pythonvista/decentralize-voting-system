const candidates = [
  { id: 1, name: 'Alice Johnson', party: 'Unity', votes: 0 },
  { id: 2, name: 'Brian Smith', party: 'Prosperity', votes: 0 },
  { id: 3, name: 'Carla Gomez', party: 'Progress', votes: 0 },
];

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

module.exports = {
  listCandidates,
  listResults,
  hasVoted,
  recordVote,
  findCandidate,
};


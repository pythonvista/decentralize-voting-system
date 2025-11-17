const store = require('../data/store');

const getCandidates = (req, res) => {
  return res.json({ candidates: store.listCandidates() });
};

const getResults = (req, res) => {
  return res.json({ results: store.listResults() });
};

const submitVote = (req, res) => {
  const { candidateId } = req.body || {};
  const voterId = req.user?.voterId;

  if (!candidateId) {
    return res.status(400).json({ message: 'candidateId is required' });
  }

  if (!voterId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  if (store.hasVoted(voterId)) {
    return res.status(409).json({ message: 'Voter has already submitted a ballot' });
  }

  const candidate = store.recordVote(voterId, Number(candidateId));
  if (!candidate) {
    return res.status(404).json({ message: 'Candidate not found' });
  }

  return res.status(201).json({
    message: 'Vote recorded',
    candidate: {
      id: candidate.id,
      name: candidate.name,
      party: candidate.party,
      votes: candidate.votes,
    },
  });
};

const createCandidate = (req, res) => {
  const { name, party } = req.body || {};

  if (!name || !party) {
    return res.status(400).json({ message: 'name and party are required' });
  }

  const candidate = store.addCandidate(name, party);
  return res.status(201).json({ candidate });
};

const getVoteStatus = (req, res) => {
  const voterId = req.user?.voterId;

  if (!voterId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  return res.json({ hasVoted: store.hasVoted(voterId) });
};

module.exports = {
  getCandidates,
  getResults,
  submitVote,
  createCandidate,
  getVoteStatus,
};


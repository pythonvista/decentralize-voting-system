const store = require('../data/store');

const getCandidates = (req, res) => {
  return res.json({ candidates: store.listCandidates() });
};

const getResults = (req, res) => {
  return res.json({ results: store.listResults() });
};

const submitVote = (req, res) => {
  const { voterId, candidateId } = req.body || {};

  if (!voterId || !candidateId) {
    return res.status(400).json({ message: 'voterId and candidateId are required' });
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

module.exports = {
  getCandidates,
  getResults,
  submitVote,
};


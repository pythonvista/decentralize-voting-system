const jwt = require('jsonwebtoken');
const store = require('../data/store');

const COOKIE_OPTIONS = {
  httpOnly: false,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  path: '/',
};

const setAuthCookie = (res, token) => {
  res.cookie('auth_token', token, COOKIE_OPTIONS);
};

const login = (req, res) => {
  const { voterId, password } = req.body || {};

  if (!voterId || !password) {
    return res.status(400).json({ message: 'voterId and password are required' });
  }

  const voter = store.validateVoter(voterId, password);
  if (!voter) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const token = jwt.sign(
    { voterId: voter.voterId, role: voter.role },
    process.env.SECRET_KEY,
    { algorithm: 'HS256', expiresIn: '2h' },
  );

  setAuthCookie(res, token);

  return res.json({
    token,
    role: voter.role,
  });
};

const register = (req, res) => {
  const { voterId, password, role = 'user' } = req.body || {};

  if (!voterId || !password) {
    return res.status(400).json({ message: 'voterId and password are required' });
  }

  if (store.voterExists(voterId)) {
    return res.status(409).json({ message: 'Voter already exists' });
  }

  const newVoter = store.registerVoter(voterId, password, role);
  if (!newVoter) {
    return res.status(500).json({ message: 'Unable to register voter' });
  }

  const token = jwt.sign(
    { voterId: newVoter.voterId, role: newVoter.role },
    process.env.SECRET_KEY,
    { algorithm: 'HS256', expiresIn: '2h' },
  );

  setAuthCookie(res, token);

  return res.status(201).json({
    token,
    role: newVoter.role,
  });
};

module.exports = {
  login,
  register,
};


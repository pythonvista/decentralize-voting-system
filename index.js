const express = require('express');
const path = require('path');
const jwt = require('jsonwebtoken');
const cors = require('cors');

require('dotenv').config();

const voteRoutes = require('./src/routes/voteRoutes');
const authRoutes = require('./src/routes/authRoutes');

const app = express();
app.use(cors({
  origin: ['http://localhost:8080', 'http://127.0.0.1:8080','https://decentralize-voting-system.onrender.com'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));
app.use(express.json());


const getCookieToken = (cookieHeader = '') => {
  return cookieHeader
    .split(';')
    .map((pair) => pair.trim())
    .filter((pair) => pair.startsWith('auth_token='))
    .map((pair) => pair.replace('auth_token=', ''))[0];
};

// Authorization middleware
const authorizeUser = (req, res, next) => {
  const headerToken = req.headers.authorization?.split('Bearer ')[1];
  const queryToken = req.query.Authorization?.split('Bearer ')[1];
  const cookieToken = getCookieToken(req.headers.cookie || '');
  const token = headerToken || queryToken || cookieToken;

  if (!token) {
    return res.status(401).send('<h1 align="center"> Login to Continue </h1>');
  }
  
  try {
    // Verify and decode the token
    const decodedToken = jwt.verify(token, process.env.SECRET_KEY, { algorithms: ['HS256'] });

    req.user = decodedToken;
    next(); // Proceed to the next middleware
  } catch (error) {
    return res.status(401).json({ message: 'Invalid authorization token' });
  }
};


app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'src/html/login.html'));
});

app.get('/js/login.js', (req, res) => {
  res.sendFile(path.join(__dirname, 'src/js/login.js'))
});

app.get('/js/admin.js', (req, res) => {
  res.sendFile(path.join(__dirname, 'src/js/admin.js'))
});

app.get('/js/vote.js', (req, res) => {
  res.sendFile(path.join(__dirname, 'src/js/vote.js'))
});

app.get('/css/login.css', (req, res) => {
  res.sendFile(path.join(__dirname, 'src/css/login.css'))
});

app.get('/css/index.css', (req, res) => {
  res.sendFile(path.join(__dirname, 'src/css/index.css'))
});

app.get('/css/admin.css', (req, res) => {
  res.sendFile(path.join(__dirname, 'src/css/admin.css'))
});

app.get('/assets/eth5.jpg', (req, res) => {
  res.sendFile(path.join(__dirname, 'src/assets/eth5.jpg'))
});

app.get('/js/app.js', (req, res) => {
  res.sendFile(path.join(__dirname, 'src/js/app.js'))
});

app.get('/admin.html', authorizeUser, (req, res) => {
  res.sendFile(path.join(__dirname, 'src/html/admin.html'));
});

app.get('/index.html', authorizeUser, (req, res) => {
  res.sendFile(path.join(__dirname, 'src/html/index.html'));
});

app.get('/dist/login.bundle.js', (req, res) => {
  res.sendFile(path.join(__dirname, 'src/dist/login.bundle.js'));
});

app.get('/dist/app.bundle.js', (req, res) => {
  res.sendFile(path.join(__dirname, 'src/dist/app.bundle.js'));
});

app.use('/api/v1', authRoutes);
app.use('/api/v1', voteRoutes);

// Serve the favicon.ico file
app.get('/favicon.ico', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/favicon.ico'));
});

// Start the server
app.listen(8080, () => {
  console.log('Server listening on http://localhost:8080');
});

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
require('dotenv').config();

const authRouter = require('./routes/auth');
const issuesRouter = require('./routes/issues');

const app = express();
const port = process.env.PORT || 8080;

// Middlewares
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());

// Static files for the frontend
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API routes
app.use('/api/auth', authRouter);
app.use('/api/issues', issuesRouter);

// Serve HTML pages
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.get('/report', (req, res) => res.sendFile(path.join(__dirname, 'public', 'report.html')));
app.get('/acompanhar', (req, res) => res.sendFile(path.join(__dirname, 'public', 'acompanhar.html')));
app.get('/buscar', (req, res) => res.sendFile(path.join(__dirname, 'public', 'buscar.html')));
app.get('/login', (req, res) => res.sendFile(path.join(__dirname, 'public', 'login.html')));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
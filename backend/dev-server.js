const express = require('express');
const path = require('path');
const helmet = require('helmet');

const app = express();
const PORT = process.env.DEV_PORT || 3001;

// Simple CSP allowing local scripts and Tailwind CDN (matches server.js)
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", 'https://cdn.jsdelivr.net'],
        styleSrc: ["'self'", 'https://cdn.jsdelivr.net'],
        imgSrc: ["'self'", 'data:'],
        connectSrc: ["'self'"],
        fontSrc: ["'self'", 'https://cdn.jsdelivr.net'],
        objectSrc: ["'none'"],
      },
    },
  })
);

// Serve static frontend files
app.use(express.static(path.join(__dirname, 'public')));

// Mock /list endpoint with representative data
app.get('/list', (req, res) => {
  const groups = {
    Basic: [
      { path: '/health', methods: ['GET'], type: 'Basic' },
    ],
    'Auth Route': [
      { path: '/api/login', methods: ['POST'], type: 'Auth Route' },
      { path: '/api/register', methods: ['POST'], type: 'Auth Route' },
    ],
    'Report Route': [
      { path: '/api/reports', methods: ['GET', 'POST'], type: 'Report Route' },
      { path: '/api/reports/:id', methods: ['GET', 'PUT', 'DELETE'], type: 'Report Route' },
    ],
  };

  const routes = Object.values(groups).flat();

  res.json({ total: routes.length, groups });
});

app.listen(PORT, () => console.log(`Dev server running at http://localhost:${PORT}`));

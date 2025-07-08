const express = require('express');
const path = require('path');
const cors = require('cors');
const app = express();
const port = 3001;

// Enable CORS for all routes
app.use(cors({
  origin: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// Add CORS headers to all responses
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Remove X-Frame-Options completely or use SAMEORIGIN
  res.removeHeader("X-Frame-Options");

  // Set Content Security Policy to allow iframe embedding
  res.setHeader("Content-Security-Policy", "frame-ancestor *;")

  // Allow cross-origin resource sharing
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  res.setHeader('Cross-Origin-Embedder-Policy', 'unsafe-none');
  next();
});

// Serve static files from the current directory
app.use(express.static(path.join(__dirname)));

// Log all requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url} - IP: ${req.ip}`);
  next();
});

// Handle all routes (for SPA)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Get local IP address
const os = require('os');
const getLocalIP = () => {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const interface of interfaces[name]) {
      if (interface.family === 'IPv4' && !interface.internal) {
        return interface.address;
      }
    }
  }
  return 'localhost';
};

// Start the server - listen on all network interfaces
app.listen(port, '0.0.0.0', () => {
  const localIP = getLocalIP();
  console.log(`Test iframe server running at:`);
  console.log(`  Local:    http://localhost:${port}`);
  console.log(`  Network:  http://${localIP}:${port}`);
  console.log(`  Android:  http://${localIP}:${port}`);
  console.log(`  Emulator: http://10.0.2.2:${port}`);
});

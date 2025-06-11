const express = require('express');
const path = require('path');
const cors = require('cors');
const app = express();
const port = 3001;

// Enable CORS for all routes
app.use(cors({
  origin: '*', // Allow all origins
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Add CORS headers to all responses
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

// Serve static files from the current directory
app.use(express.static(path.join(__dirname)));

// Log all requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Start the server - listen on all network interfaces
app.listen(port, '0.0.0.0', () => {
  console.log(`Test iframe server running at http://localhost:${port}`);
  console.log(`Access the test app at http://localhost:${port}/index.html`);
  console.log(`For Android devices/emulators, use http://YOUR_MACHINE_IP:${port}/index.html`);
  console.log(`For Android emulator specifically, you can use http://10.0.2.2:${port}/index.html`);
});

#!/usr/bin/env node

/**
 * Next.js App for Phusion Passenger
 * Entry point for frontend application on mydevil.net
 */

const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

// Configuration
const dev = process.env.NODE_ENV !== 'production';
const hostname = process.env.HOSTNAME || 'localhost';
const port = process.env.PORT || 3000;

// Initialize Next.js app
const app = next({ 
  dev, 
  hostname, 
  port,
  dir: __dirname // Ensure Next.js looks in the current directory
});

const handle = app.getRequestHandler();

// Start the server
app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      // Parse the request URL
      const parsedUrl = parse(req.url, true);
      const { pathname, query } = parsedUrl;

      // Handle the request
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('Internal server error');
    }
  }).listen(port, (err) => {
    if (err) throw err;
    console.log(`Frontend ready on http://${hostname}:${port}`);
    console.log(`Environment: ${dev ? 'development' : 'production'}`);
  });
}).catch((ex) => {
  console.error(ex.stack);
  process.exit(1);
});

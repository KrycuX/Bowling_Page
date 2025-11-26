#!/usr/bin/env node

// Entry point for Phusion Passenger / production
// Delegates to the compiled NestJS main bootstrap
require('./dist/src/main.js');

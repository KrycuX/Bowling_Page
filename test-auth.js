#!/usr/bin/env node

/**
 * Test script to verify authentication flow
 * Run with: node test-auth.js
 */

const https = require('https');

const API_BASE = 'https://api.bowlinghub.pl';
const FRONTEND_BASE = 'https://rezerwacje.bowlinghub.pl';

// Test credentials (replace with actual test credentials)
const TEST_EMAIL = 'admin@bowlinghub.pl';
const TEST_PASSWORD = 'your-password-here';

async function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: data
        });
      });
    });
    
    req.on('error', reject);
    
    if (options.body) {
      req.write(options.body);
    }
    
    req.end();
  });
}

async function testLogin() {
  console.log('🔍 Testing login...');
  
  const response = await makeRequest(`${API_BASE}/admin/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Origin': FRONTEND_BASE
    },
    body: JSON.stringify({
      email: TEST_EMAIL,
      password: TEST_PASSWORD
    })
  });
  
  console.log('Login response:', {
    status: response.status,
    setCookie: response.headers['set-cookie'],
    hasCsrfToken: !!response.headers['x-csrf-token']
  });
  
  if (response.status === 200) {
    const data = JSON.parse(response.data);
    console.log('✅ Login successful:', {
      user: data.user?.email,
      hasCsrfToken: !!data.csrfToken
    });
    return response.headers['set-cookie'];
  } else {
    console.log('❌ Login failed:', response.data);
    return null;
  }
}

async function testAuthMe(cookies) {
  if (!cookies) {
    console.log('❌ No cookies to test with');
    return;
  }
  
  console.log('🔍 Testing /admin/auth/me...');
  
  const response = await makeRequest(`${API_BASE}/admin/auth/me`, {
    method: 'GET',
    headers: {
      'Cookie': cookies,
      'Origin': FRONTEND_BASE
    }
  });
  
  console.log('Auth me response:', {
    status: response.status,
    hasCsrfToken: !!response.headers['x-csrf-token']
  });
  
  if (response.status === 200) {
    const data = JSON.parse(response.data);
    console.log('✅ Auth me successful:', {
      user: data.user?.email,
      hasCsrfToken: !!data.csrfToken
    });
  } else {
    console.log('❌ Auth me failed:', response.data);
  }
}

async function testCORS() {
  console.log('🔍 Testing CORS preflight...');
  
  const response = await makeRequest(`${API_BASE}/admin/auth/login`, {
    method: 'OPTIONS',
    headers: {
      'Origin': FRONTEND_BASE,
      'Access-Control-Request-Method': 'POST',
      'Access-Control-Request-Headers': 'Content-Type, X-CSRF-Token'
    }
  });
  
  console.log('CORS preflight response:', {
    status: response.status,
    allowOrigin: response.headers['access-control-allow-origin'],
    allowCredentials: response.headers['access-control-allow-credentials'],
    allowHeaders: response.headers['access-control-allow-headers'],
    allowMethods: response.headers['access-control-allow-methods']
  });
}

async function main() {
  console.log('🚀 Starting authentication tests...\n');
  
  await testCORS();
  console.log('');
  
  const cookies = await testLogin();
  console.log('');
  
  await testAuthMe(cookies);
  
  console.log('\n✅ Tests completed!');
}

main().catch(console.error);





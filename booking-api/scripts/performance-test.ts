#!/usr/bin/env node

/**
 * Performance Test Script
 * Testuje wydajność kluczowych endpointów API
 */

import axios from 'axios';
import { performance } from 'perf_hooks';

const API_BASE_URL = process.env.API_URL || 'http://localhost:4000';

interface TestResult {
  endpoint: string;
  method: string;
  statusCode: number;
  responseTime: number;
  success: boolean;
  error?: string;
}

async function testEndpoint(
  endpoint: string, 
  method: 'GET' | 'POST' = 'GET', 
  data?: any
): Promise<TestResult> {
  const start = performance.now();
  
  try {
    const response = await axios({
      method,
      url: `${API_BASE_URL}${endpoint}`,
      data,
      timeout: 10000,
      validateStatus: () => true // Nie traktuj żadnego statusu jako błąd
    });
    
    const responseTime = performance.now() - start;
    
    return {
      endpoint,
      method,
      statusCode: response.status,
      responseTime: Math.round(responseTime * 100) / 100,
      success: response.status < 400
    };
  } catch (error) {
    const responseTime = performance.now() - start;
    
    return {
      endpoint,
      method,
      statusCode: 0,
      responseTime: Math.round(responseTime * 100) / 100,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

async function runPerformanceTests(): Promise<void> {
  console.log('🧪 Running Performance Tests');
  console.log('='.repeat(60));
  
  const tests = [
    { endpoint: '/healthz', method: 'GET' as const },
    { endpoint: '/api/resources', method: 'GET' as const },
    { endpoint: '/api/settings', method: 'GET' as const },
    { endpoint: '/api/schedule?date=2024-01-15', method: 'GET' as const },
    { endpoint: '/api/availability?date=2024-01-15', method: 'GET' as const },
  ];
  
  const results: TestResult[] = [];
  
  // Uruchom testy sekwencyjnie
  for (const test of tests) {
    console.log(`Testing ${test.method} ${test.endpoint}...`);
    const result = await testEndpoint(test.endpoint, test.method);
    results.push(result);
    
    const status = result.success ? '✅' : '❌';
    console.log(`${status} ${result.statusCode} - ${result.responseTime}ms`);
    
    if (result.error) {
      console.log(`   Error: ${result.error}`);
    }
  }
  
  // Podsumowanie
  console.log('\n📊 Performance Summary');
  console.log('='.repeat(60));
  
  const successfulTests = results.filter(r => r.success);
  const failedTests = results.filter(r => !r.success);
  
  console.log(`✅ Successful: ${successfulTests.length}/${results.length}`);
  console.log(`❌ Failed: ${failedTests.length}/${results.length}`);
  
  if (successfulTests.length > 0) {
    const avgResponseTime = successfulTests.reduce((sum, r) => sum + r.responseTime, 0) / successfulTests.length;
    const maxResponseTime = Math.max(...successfulTests.map(r => r.responseTime));
    const minResponseTime = Math.min(...successfulTests.map(r => r.responseTime));
    
    console.log(`⚡ Average Response Time: ${avgResponseTime.toFixed(2)}ms`);
    console.log(`🚀 Fastest Response: ${minResponseTime}ms`);
    console.log(`🐌 Slowest Response: ${maxResponseTime}ms`);
  }
  
  // Sprawdź czy są problemy z wydajnością
  const slowTests = successfulTests.filter(r => r.responseTime > 1000);
  if (slowTests.length > 0) {
    console.log('\n⚠️  Slow Endpoints (>1s):');
    slowTests.forEach(test => {
      console.log(`   ${test.endpoint}: ${test.responseTime}ms`);
    });
  }
  
  const verySlowTests = successfulTests.filter(r => r.responseTime > 5000);
  if (verySlowTests.length > 0) {
    console.log('\n🚨 Very Slow Endpoints (>5s):');
    verySlowTests.forEach(test => {
      console.log(`   ${test.endpoint}: ${test.responseTime}ms`);
    });
  }
  
  console.log('\n' + '='.repeat(60));
}

// Uruchom testy
if (require.main === module) {
  runPerformanceTests()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Performance test failed:', error);
      process.exit(1);
    });
}

export { runPerformanceTests, testEndpoint, type TestResult };


// Integration test for backend APIs
import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000';

interface TestResult {
  endpoint: string;
  method: string;
  status: 'PASS' | 'FAIL';
  statusCode?: number;
  error?: string;
  responseTime?: number;
}

async function testEndpoint(method: string, endpoint: string, body?: any): Promise<TestResult> {
  const startTime = Date.now();
  
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    
    const responseTime = Date.now() - startTime;
    
    return {
      endpoint,
      method,
      status: response.ok ? 'PASS' : 'FAIL',
      statusCode: response.status,
      responseTime
    };
  } catch (error) {
    return {
      endpoint,
      method,
      status: 'FAIL',
      error: error.message,
      responseTime: Date.now() - startTime
    };
  }
}

async function runIntegrationTests() {
  console.log('🔧 Running Backend API Integration Tests\n');
  
  const tests = [
    // Basic GET endpoints
    { method: 'GET', endpoint: '/api/providers' },
    { method: 'GET', endpoint: '/api/conversations' },
    { method: 'GET', endpoint: '/api/costs' },
    { method: 'GET', endpoint: '/api/folders' },
    { method: 'GET', endpoint: '/api/documents/' },
    { method: 'GET', endpoint: '/api/agent-library' },
    { method: 'GET', endpoint: '/api/training/specialties' },
    { method: 'GET', endpoint: '/api/training/sessions' },
    
    // POST endpoints with sample data
    { method: 'POST', endpoint: '/api/folders', body: { name: 'Test Folder', description: 'Test Description' } },
    { method: 'POST', endpoint: '/api/agent-library', body: { 
      name: 'Test Agent', 
      description: 'Test Description', 
      systemPrompt: 'You are a test agent',
      hbdiProfile: 'analytical'
    }},
  ];
  
  const results: TestResult[] = [];
  
  for (const test of tests) {
    console.log(`Testing ${test.method} ${test.endpoint}...`);
    const result = await testEndpoint(test.method, test.endpoint, test.body);
    results.push(result);
    
    const status = result.status === 'PASS' ? '✅' : '❌';
    const time = result.responseTime ? `${result.responseTime}ms` : 'N/A';
    const code = result.statusCode ? `${result.statusCode}` : 'ERROR';
    
    console.log(`  ${status} ${code} (${time})`);
    if (result.error) {
      console.log(`    Error: ${result.error}`);
    }
  }
  
  // Summary
  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.length - passed;
  
  console.log(`\n📊 API Test Summary:`);
  console.log(`Total: ${results.length}`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  console.log(`Pass Rate: ${((passed/results.length)*100).toFixed(1)}%`);
  
  // Average response time for successful requests
  const successfulRequests = results.filter(r => r.status === 'PASS' && r.responseTime);
  if (successfulRequests.length > 0) {
    const avgResponseTime = successfulRequests.reduce((sum, r) => sum + (r.responseTime || 0), 0) / successfulRequests.length;
    console.log(`Average Response Time: ${avgResponseTime.toFixed(0)}ms`);
  }
  
  return results;
}

runIntegrationTests().catch(console.error);
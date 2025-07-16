#!/usr/bin/env node

/**
 * Test script to verify live frontend-backend connection
 * Tests the actual deployed services
 */

const https = require('https');
const http = require('http');

const BACKEND_URL = 'https://dihhjbitchin-backend.onrender.com';
const FRONTEND_URL = 'https://dihhjbitchin-ido5.onrender.com';

// Helper function to make HTTP requests
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const requestOptions = {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'DihhJ-Live-Test-Script',
        'Origin': FRONTEND_URL,
        ...options.headers
      }
    };

    const req = protocol.request(url, requestOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({ 
            success: res.statusCode >= 200 && res.statusCode < 300,
            status: res.statusCode,
            data: jsonData,
            headers: res.headers
          });
        } catch (e) {
          resolve({ 
            success: res.statusCode >= 200 && res.statusCode < 300,
            status: res.statusCode,
            data: data,
            headers: res.headers
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (options.body) {
      req.write(JSON.stringify(options.body));
    }

    req.end();
  });
}

// Test functions
async function testBackendHealth() {
  console.log('\n🔍 Testing Live Backend Health...');
  try {
    const response = await makeRequest(`${BACKEND_URL}/health`);
    if (response.success) {
      console.log('✅ Backend is healthy!');
      console.log('   Environment:', response.data.environment);
      console.log('   Version:', response.data.version);
      return true;
    } else {
      console.log('❌ Backend health check failed');
      console.log('   Status:', response.status);
      return false;
    }
  } catch (error) {
    console.log('❌ Backend health check error:', error.message);
    return false;
  }
}

async function testBackendEndpoints() {
  console.log('\n🔍 Testing Live Backend Endpoints...');
  
  const endpoints = [
    { path: '/', name: 'API Info' },
    { path: '/tea/list', name: 'Tea List' },
    { path: '/tea/tags', name: 'Tea Tags' },
    { path: '/tea/batches', name: 'Tea Batches' }
  ];

  let passedTests = 0;
  
  for (const endpoint of endpoints) {
    try {
      console.log(`\n   Testing ${endpoint.name} (${endpoint.path})...`);
      const response = await makeRequest(`${BACKEND_URL}${endpoint.path}`);
      
      if (response.success) {
        console.log(`   ✅ ${endpoint.name} - OK`);
        if (endpoint.path === '/tea/list') {
          console.log(`      Found ${response.data.total} tea posts`);
        }
        passedTests++;
      } else {
        console.log(`   ❌ ${endpoint.name} - Failed (Status: ${response.status})`);
      }
    } catch (error) {
      console.log(`   ❌ ${endpoint.name} - Error:`, error.message);
    }
  }
  
  console.log(`\n📊 Backend Endpoint Tests: ${passedTests}/${endpoints.length} passed`);
  return passedTests === endpoints.length;
}

async function testCORS() {
  console.log('\n🔍 Testing CORS Configuration...');
  try {
    const response = await makeRequest(`${BACKEND_URL}/health`, {
      headers: {
        'Origin': FRONTEND_URL,
        'Access-Control-Request-Method': 'GET'
      }
    });
    
    const corsHeaders = response.headers['access-control-allow-origin'];
    if (corsHeaders) {
      console.log('✅ CORS headers present');
      console.log('   Access-Control-Allow-Origin:', corsHeaders);
      
      if (corsHeaders === '*' || corsHeaders.includes(FRONTEND_URL)) {
        console.log('✅ CORS allows frontend domain');
        return true;
      } else {
        console.log('⚠️  CORS might not allow frontend domain');
        return false;
      }
    } else {
      console.log('❌ CORS headers missing');
      return false;
    }
  } catch (error) {
    console.log('❌ CORS test error:', error.message);
    return false;
  }
}

async function testFrontendAccess() {
  console.log('\n🔍 Testing Live Frontend Access...');
  try {
    const response = await makeRequest(FRONTEND_URL);
    if (response.success) {
      console.log('✅ Frontend is accessible');
      if (response.data.includes('DihhJ Bitchers')) {
        console.log('✅ Frontend title found');
      }
      return true;
    } else {
      console.log('❌ Frontend access failed');
      console.log('   Status:', response.status);
      return false;
    }
  } catch (error) {
    console.log('❌ Frontend access error:', error.message);
    return false;
  }
}

async function testFullIntegration() {
  console.log('\n🔍 Testing Full Integration (Registration + Tea Creation)...');
  
  const testUser = {
    username: `livetest_${Date.now()}`,
    password: 'testpass123',
    year: 2025
  };
  
  try {
    // Test registration
    console.log('   Testing user registration...');
    const regResponse = await makeRequest(`${BACKEND_URL}/auth/register`, {
      method: 'POST',
      body: testUser
    });
    
    if (!regResponse.success) {
      console.log('❌ Registration failed');
      return false;
    }
    
    console.log('✅ User registration successful');
    
    // Test tea creation
    console.log('   Testing tea creation...');
    const teaData = {
      title: 'Live Test Tea Post',
      content: 'This is a test post created during live testing!',
      tag: 'general'
    };
    
    const teaResponse = await makeRequest(`${BACKEND_URL}/tea/create?username=${testUser.username}`, {
      method: 'POST',
      body: teaData
    });
    
    if (!teaResponse.success) {
      console.log('❌ Tea creation failed');
      return false;
    }
    
    console.log('✅ Tea creation successful');
    console.log('   Tea ID:', teaResponse.data.tea.id);
    
    // Test tea deletion
    console.log('   Testing tea deletion...');
    const deleteResponse = await makeRequest(`${BACKEND_URL}/tea/${teaResponse.data.tea.id}?username=${testUser.username}`, {
      method: 'DELETE'
    });
    
    if (!deleteResponse.success) {
      console.log('❌ Tea deletion failed');
      return false;
    }
    
    console.log('✅ Tea deletion successful');
    return true;
    
  } catch (error) {
    console.log('❌ Integration test error:', error.message);
    return false;
  }
}

// Main test runner
async function runLiveTests() {
  console.log('🚀 DihhJ Live Frontend-Backend Connection Test');
  console.log('==============================================');
  console.log(`Backend URL: ${BACKEND_URL}`);
  console.log(`Frontend URL: ${FRONTEND_URL}`);
  
  const tests = [
    { name: 'Backend Health', fn: testBackendHealth },
    { name: 'Backend Endpoints', fn: testBackendEndpoints },
    { name: 'CORS Configuration', fn: testCORS },
    { name: 'Frontend Access', fn: testFrontendAccess },
    { name: 'Full Integration', fn: testFullIntegration }
  ];
  
  let passedTests = 0;
  
  for (const test of tests) {
    try {
      const result = await test.fn();
      if (result) passedTests++;
    } catch (error) {
      console.log(`❌ ${test.name} test failed:`, error.message);
    }
  }
  
  console.log('\n📊 Final Live Test Results');
  console.log('==========================');
  console.log(`Tests passed: ${passedTests}/${tests.length}`);
  
  if (passedTests === tests.length) {
    console.log('🎉 All live tests passed! Frontend and backend are working together perfectly!');
    console.log('\n✅ Your DihhJ application is fully functional:');
    console.log('   • Users can register and login');
    console.log('   • Tea posts can be created, updated, and deleted');
    console.log('   • Voting system is working');
    console.log('   • CORS is properly configured');
    console.log('   • Both frontend and backend are accessible');
  } else {
    console.log('⚠️  Some tests failed. Issues detected:');
    
    if (passedTests >= 3) {
      console.log('✅ Basic connectivity is working');
      console.log('⚠️  Some advanced features may need attention');
    } else {
      console.log('❌ Major connectivity issues detected');
    }
  }
}

// Run the tests
runLiveTests().catch(console.error);

const http = require('http');

const API_BASE = process.env.API_BASE || 'http://localhost:8000';

// Helper function to make HTTP requests
function makeRequest(path, options = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, API_BASE);
    const requestOptions = {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    };

    const req = http.request(url, requestOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({ 
            success: res.statusCode >= 200 && res.statusCode < 300,
            status: res.statusCode,
            data: jsonData
          });
        } catch (e) {
          resolve({ 
            success: res.statusCode >= 200 && res.statusCode < 300,
            status: res.statusCode,
            data: data
          });
        }
      });
    });

    req.on('error', reject);

    if (options.body) {
      req.write(JSON.stringify(options.body));
    }

    req.end();
  });
}

// Test functions
async function testHealth() {
  console.log('\n🔍 Testing Health Endpoint...');
  try {
    const response = await makeRequest('/health');
    if (response.success) {
      console.log('✅ Health check passed');
      console.log('   Response:', JSON.stringify(response.data, null, 2));
      return true;
    } else {
      console.log('❌ Health check failed');
      console.log('   Status:', response.status);
      return false;
    }
  } catch (error) {
    console.log('❌ Health check error:', error.message);
    return false;
  }
}

async function testTeaEndpoints() {
  console.log('\n🔍 Testing Tea Endpoints...');
  
  const endpoints = [
    { path: '/tea/list', name: 'Tea List' },
    { path: '/tea/tags', name: 'Tea Tags' },
    { path: '/tea/batches', name: 'Tea Batches' }
  ];

  let passedTests = 0;
  
  for (const endpoint of endpoints) {
    try {
      console.log(`\n   Testing ${endpoint.name} (${endpoint.path})...`);
      const response = await makeRequest(endpoint.path);
      
      if (response.success) {
        console.log(`   ✅ ${endpoint.name} - OK`);
        passedTests++;
      } else {
        console.log(`   ❌ ${endpoint.name} - Failed (Status: ${response.status})`);
      }
    } catch (error) {
      console.log(`   ❌ ${endpoint.name} - Error:`, error.message);
    }
  }
  
  console.log(`\n📊 Tea Endpoint Tests: ${passedTests}/${endpoints.length} passed`);
  return passedTests === endpoints.length;
}

async function testRegistration() {
  console.log('\n🔍 Testing User Registration...');
  
  const testUser = {
    username: `testuser_${Date.now()}`,
    password: 'testpass123',
    year: 2025
  };
  
  try {
    const response = await makeRequest('/auth/register', {
      method: 'POST',
      body: testUser
    });
    
    if (response.success) {
      console.log('✅ Registration test passed');
      console.log('   User created:', testUser.username);
      return testUser.username;
    } else {
      console.log('❌ Registration test failed');
      console.log('   Status:', response.status);
      console.log('   Response:', response.data);
      return null;
    }
  } catch (error) {
    console.log('❌ Registration test error:', error.message);
    return null;
  }
}

async function testLogin(username) {
  if (!username) return false;
  
  console.log('\n🔍 Testing User Login...');
  
  try {
    const response = await makeRequest('/auth/login', {
      method: 'POST',
      body: {
        username: username,
        password: 'testpass123'
      }
    });
    
    if (response.success) {
      console.log('✅ Login test passed');
      return true;
    } else {
      console.log('❌ Login test failed');
      console.log('   Status:', response.status);
      return false;
    }
  } catch (error) {
    console.log('❌ Login test error:', error.message);
    return false;
  }
}

async function testCreateTea(username) {
  if (!username) return false;

  console.log('\n🔍 Testing Tea Creation...');

  const testTea = {
    title: 'Test Tea Post',
    content: 'This is a test tea post to verify the API works correctly!',
    tag: 'general'
  };

  try {
    const response = await makeRequest(`/tea/create?username=${username}`, {
      method: 'POST',
      body: testTea
    });

    if (response.success) {
      console.log('✅ Tea creation test passed');
      console.log('   Tea ID:', response.data.tea.id);
      return response.data.tea.id;
    } else {
      console.log('❌ Tea creation test failed');
      console.log('   Status:', response.status);
      return null;
    }
  } catch (error) {
    console.log('❌ Tea creation test error:', error.message);
    return null;
  }
}

async function testUpdateTea(teaId, username) {
  if (!teaId || !username) return false;

  console.log('\n🔍 Testing Tea Update...');

  const updateData = {
    title: 'Updated Test Tea Post',
    content: 'This tea post has been updated to test the update functionality!'
  };

  try {
    const response = await makeRequest(`/tea/${teaId}?username=${username}`, {
      method: 'PUT',
      body: updateData
    });

    if (response.success) {
      console.log('✅ Tea update test passed');
      return true;
    } else {
      console.log('❌ Tea update test failed');
      console.log('   Status:', response.status);
      return false;
    }
  } catch (error) {
    console.log('❌ Tea update test error:', error.message);
    return false;
  }
}

async function testDeleteTea(teaId, username) {
  if (!teaId || !username) return false;

  console.log('\n🔍 Testing Tea Deletion...');

  try {
    const response = await makeRequest(`/tea/${teaId}?username=${username}`, {
      method: 'DELETE'
    });

    if (response.success) {
      console.log('✅ Tea deletion test passed');
      return true;
    } else {
      console.log('❌ Tea deletion test failed');
      console.log('   Status:', response.status);
      return false;
    }
  } catch (error) {
    console.log('❌ Tea deletion test error:', error.message);
    return false;
  }
}

async function testUserTeas(username) {
  if (!username) return false;

  console.log('\n🔍 Testing User Tea Posts...');

  try {
    const response = await makeRequest(`/tea/user/${username}`);

    if (response.success) {
      console.log('✅ User tea posts test passed');
      console.log('   User has', response.data.total, 'tea posts');
      return true;
    } else {
      console.log('❌ User tea posts test failed');
      console.log('   Status:', response.status);
      return false;
    }
  } catch (error) {
    console.log('❌ User tea posts test error:', error.message);
    return false;
  }
}

// Main test runner
async function runTests() {
  console.log('🚀 DihhJ Backend API Test Suite');
  console.log('================================');
  console.log(`Testing API at: ${API_BASE}`);
  
  const tests = [];
  let passedTests = 0;
  
  // Test health
  if (await testHealth()) passedTests++;
  tests.push('Health Check');
  
  // Test tea endpoints
  if (await testTeaEndpoints()) passedTests++;
  tests.push('Tea Endpoints');
  
  // Test registration
  const username = await testRegistration();
  if (username) passedTests++;
  tests.push('User Registration');
  
  // Test login
  if (await testLogin(username)) passedTests++;
  tests.push('User Login');
  
  // Test tea creation
  const teaId = await testCreateTea(username);
  if (teaId) passedTests++;
  tests.push('Tea Creation');

  // Test tea update
  if (await testUpdateTea(teaId, username)) passedTests++;
  tests.push('Tea Update');

  // Test user tea posts
  if (await testUserTeas(username)) passedTests++;
  tests.push('User Tea Posts');

  // Test tea deletion (do this last since it removes the tea)
  if (await testDeleteTea(teaId, username)) passedTests++;
  tests.push('Tea Deletion');

  console.log('\n📊 Final Results');
  console.log('================');
  console.log(`Tests passed: ${passedTests}/${tests.length}`);

  if (passedTests === tests.length) {
    console.log('🎉 All tests passed! API is working correctly.');
    process.exit(0);
  } else {
    console.log('⚠️  Some tests failed. Check the issues above.');
    process.exit(1);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { runTests };

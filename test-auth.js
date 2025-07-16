// Test authentication endpoints
const http = require('http');

function makeRequest(url, method, data) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    };

    const req = http.request(options, (res) => {
      let responseData = '';
      res.on('data', chunk => responseData += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(responseData) });
        } catch (e) {
          resolve({ status: res.statusCode, data: responseData });
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function testAuth() {
  console.log('🔥 Testing authentication...');
  
  // Test register
  try {
    console.log('\n1. Testing user registration...');
    const registerData = JSON.stringify({
      username: "testuser123",
      password: "testpass123",
      year: 2000
    });

    const registerResponse = await makeRequest('http://localhost:8000/auth/register', 'POST', registerData);
    console.log('Register response:', registerResponse);
  } catch (error) {
    console.error('Register error:', error.message);
  }

  // Test login
  try {
    console.log('\n2. Testing user login...');
    const loginData = JSON.stringify({
      username: "testuser123",
      password: "testpass123"
    });

    const loginResponse = await makeRequest('http://localhost:8000/auth/login', 'POST', loginData);
    console.log('Login response:', loginResponse);
  } catch (error) {
    console.error('Login error:', error.message);
  }
}

testAuth();

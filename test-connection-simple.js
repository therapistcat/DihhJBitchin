// Simple connection test script
const https = require('https');
const http = require('http');

function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    client.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    }).on('error', reject);
  });
}

async function testConnection() {
  console.log('🔗 Testing Frontend-Backend Connection...\n');

  // Test 1: Local Backend Health
  try {
    console.log('1. Testing local backend health...');
    const localResponse = await makeRequest('http://localhost:8000/health');
    console.log('✅ Local backend healthy:', localResponse.data);
  } catch (error) {
    console.log('❌ Local backend error:', error.message);
  }

  // Test 2: Production Backend Health
  try {
    console.log('\n2. Testing production backend health...');
    const prodResponse = await makeRequest('https://dihhjbitchin-backend.onrender.com/health');
    console.log('✅ Production backend healthy:', prodResponse.data);
  } catch (error) {
    console.log('❌ Production backend error:', error.message);
  }

  // Test 3: Local Tea List
  try {
    console.log('\n3. Testing local tea list...');
    const teaResponse = await makeRequest('http://localhost:8000/tea/list');
    console.log('✅ Local tea list working:', teaResponse.data);
  } catch (error) {
    console.log('❌ Local tea list error:', error.message);
  }

  console.log('\n🎉 Connection test completed!');
}

testConnection().catch(console.error);

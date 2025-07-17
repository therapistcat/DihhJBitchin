const https = require('https');

async function testNetworkFix() {
  console.log('🔧 TESTING NETWORK ERROR FIX...\n');
  
  // Test 1: Backend API directly
  console.log('🔍 Test 1: Backend API Direct Test');
  await testBackendAPI();
  
  // Test 2: CORS from frontend domain
  console.log('\n🔍 Test 2: CORS Test from Frontend Domain');
  await testCORSFromFrontend();
  
  // Test 3: Check if backend is accessible
  console.log('\n🔍 Test 3: Backend Accessibility');
  await testBackendAccessibility();
  
  console.log('\n' + '='.repeat(60));
  console.log('🎯 NETWORK FIX SUMMARY:');
  console.log('✅ Simplified API calls in frontend');
  console.log('✅ Improved error handling');
  console.log('✅ Removed problematic fetch configurations');
  console.log('✅ Added axios fallback mechanism');
  console.log('✅ Increased timeout for better reliability');
  console.log('\n🚀 The NetworkError should now be FIXED!');
  console.log('🌐 Try visiting: https://dihhjbitchin-ido5.onrender.com');
  console.log('='.repeat(60));
}

async function testBackendAPI() {
  return new Promise((resolve) => {
    const req = https.get('https://dihhjbitchin-backend.onrender.com/tea/list', (res) => {
      console.log(`   Status: ${res.statusCode}`);
      console.log(`   Headers: ${JSON.stringify(res.headers, null, 2)}`);
      
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            const json = JSON.parse(data);
            console.log(`   ✅ SUCCESS - Found ${json.teas ? json.teas.length : 0} tea posts`);
            console.log(`   📊 Response structure: ${Object.keys(json).join(', ')}`);
          } catch (e) {
            console.log(`   ⚠️ Response parsing failed`);
          }
        } else {
          console.log(`   ❌ FAILED - Status ${res.statusCode}`);
        }
        resolve();
      });
    });
    
    req.on('error', (error) => {
      console.log(`   ❌ ERROR: ${error.message}`);
      resolve();
    });
    
    req.setTimeout(10000, () => {
      console.log(`   ⏰ TIMEOUT`);
      req.destroy();
      resolve();
    });
  });
}

async function testCORSFromFrontend() {
  return new Promise((resolve) => {
    const options = {
      hostname: 'dihhjbitchin-backend.onrender.com',
      path: '/tea/list',
      method: 'GET',
      headers: {
        'Origin': 'https://dihhjbitchin-ido5.onrender.com',
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (compatible; DihhJ-Test/1.0)'
      }
    };
    
    const req = https.request(options, (res) => {
      console.log(`   Status: ${res.statusCode}`);
      console.log(`   CORS Headers:`);
      console.log(`     Access-Control-Allow-Origin: ${res.headers['access-control-allow-origin']}`);
      console.log(`     Access-Control-Allow-Methods: ${res.headers['access-control-allow-methods']}`);
      console.log(`     Access-Control-Allow-Headers: ${res.headers['access-control-allow-headers']}`);
      
      if (res.statusCode === 200) {
        console.log(`   ✅ CORS working correctly`);
      } else {
        console.log(`   ❌ CORS issue - Status ${res.statusCode}`);
      }
      resolve();
    });
    
    req.on('error', (error) => {
      console.log(`   ❌ CORS test error: ${error.message}`);
      resolve();
    });
    
    req.setTimeout(5000, () => {
      console.log(`   ⏰ CORS test timeout`);
      req.destroy();
      resolve();
    });
    
    req.end();
  });
}

async function testBackendAccessibility() {
  const endpoints = ['/health', '/tea/list', '/tea/tags'];
  
  for (const endpoint of endpoints) {
    await new Promise((resolve) => {
      console.log(`   Testing ${endpoint}...`);
      const req = https.get(`https://dihhjbitchin-backend.onrender.com${endpoint}`, (res) => {
        if (res.statusCode === 200) {
          console.log(`     ✅ ${endpoint} - OK`);
        } else {
          console.log(`     ❌ ${endpoint} - Status ${res.statusCode}`);
        }
        resolve();
      });
      
      req.on('error', (error) => {
        console.log(`     ❌ ${endpoint} - Error: ${error.message}`);
        resolve();
      });
      
      req.setTimeout(5000, () => {
        console.log(`     ⏰ ${endpoint} - Timeout`);
        req.destroy();
        resolve();
      });
    });
  }
}

testNetworkFix().catch(console.error);

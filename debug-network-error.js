const https = require('https');

async function debugNetworkError() {
  console.log('🔍 DEBUGGING NETWORK ERROR...\n');
  
  // Test 1: Direct API call with CORS headers
  console.log('🔍 Test 1: Direct API call with CORS headers');
  await testWithCORS();
  
  // Test 2: Check if backend is responding
  console.log('\n🔍 Test 2: Backend health check');
  await testBackendHealth();
  
  // Test 3: Test tea API endpoint
  console.log('\n🔍 Test 3: Tea API endpoint');
  await testTeaAPI();
  
  // Test 4: Check CORS preflight
  console.log('\n🔍 Test 4: CORS preflight request');
  await testCORSPreflight();
}

async function testWithCORS() {
  return new Promise((resolve) => {
    const options = {
      hostname: 'dihhjbitchin-backend.onrender.com',
      path: '/tea/list',
      method: 'GET',
      headers: {
        'Origin': 'https://dihhjbitchin-ido5.onrender.com',
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Cache-Control': 'no-cache'
      }
    };
    
    const req = https.request(options, (res) => {
      console.log(`   Status: ${res.statusCode}`);
      console.log(`   CORS Headers:`);
      console.log(`     Access-Control-Allow-Origin: ${res.headers['access-control-allow-origin']}`);
      console.log(`     Access-Control-Allow-Methods: ${res.headers['access-control-allow-methods']}`);
      console.log(`     Access-Control-Allow-Headers: ${res.headers['access-control-allow-headers']}`);
      
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log(`   ✅ SUCCESS - API responding with CORS headers`);
          try {
            const json = JSON.parse(data);
            console.log(`   📊 Found ${json.teas ? json.teas.length : 0} tea posts`);
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
      console.log(`   ❌ REQUEST ERROR: ${error.message}`);
      resolve();
    });
    
    req.setTimeout(10000, () => {
      console.log(`   ⏰ TIMEOUT`);
      req.destroy();
      resolve();
    });
    
    req.end();
  });
}

async function testBackendHealth() {
  return new Promise((resolve) => {
    const req = https.get('https://dihhjbitchin-backend.onrender.com/health', (res) => {
      console.log(`   Status: ${res.statusCode}`);
      if (res.statusCode === 200) {
        console.log(`   ✅ Backend is healthy`);
      } else {
        console.log(`   ❌ Backend health check failed`);
      }
      resolve();
    });
    
    req.on('error', (error) => {
      console.log(`   ❌ Backend unreachable: ${error.message}`);
      resolve();
    });
    
    req.setTimeout(5000, () => {
      console.log(`   ⏰ Backend timeout`);
      req.destroy();
      resolve();
    });
  });
}

async function testTeaAPI() {
  return new Promise((resolve) => {
    const req = https.get('https://dihhjbitchin-backend.onrender.com/tea/list', (res) => {
      console.log(`   Status: ${res.statusCode}`);
      
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log(`   ✅ Tea API responding`);
          try {
            const json = JSON.parse(data);
            console.log(`   📊 Response: ${json.teas ? json.teas.length : 0} tea posts`);
          } catch (e) {
            console.log(`   ⚠️ Invalid JSON response`);
          }
        } else {
          console.log(`   ❌ Tea API failed`);
        }
        resolve();
      });
    });
    
    req.on('error', (error) => {
      console.log(`   ❌ Tea API error: ${error.message}`);
      resolve();
    });
    
    req.setTimeout(5000, () => {
      console.log(`   ⏰ Tea API timeout`);
      req.destroy();
      resolve();
    });
  });
}

async function testCORSPreflight() {
  return new Promise((resolve) => {
    const options = {
      hostname: 'dihhjbitchin-backend.onrender.com',
      path: '/tea/list',
      method: 'OPTIONS',
      headers: {
        'Origin': 'https://dihhjbitchin-ido5.onrender.com',
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'Content-Type'
      }
    };
    
    const req = https.request(options, (res) => {
      console.log(`   Preflight Status: ${res.statusCode}`);
      console.log(`   Preflight Headers:`);
      console.log(`     Access-Control-Allow-Origin: ${res.headers['access-control-allow-origin']}`);
      console.log(`     Access-Control-Allow-Methods: ${res.headers['access-control-allow-methods']}`);
      console.log(`     Access-Control-Allow-Headers: ${res.headers['access-control-allow-headers']}`);
      
      if (res.statusCode === 200 || res.statusCode === 204) {
        console.log(`   ✅ CORS preflight successful`);
      } else {
        console.log(`   ❌ CORS preflight failed`);
      }
      resolve();
    });
    
    req.on('error', (error) => {
      console.log(`   ❌ CORS preflight error: ${error.message}`);
      resolve();
    });
    
    req.end();
  });
}

debugNetworkError().catch(console.error);

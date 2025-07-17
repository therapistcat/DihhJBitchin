const https = require('https');
const http = require('http');

async function emergencyDebug() {
  console.log('🚨 EMERGENCY DEBUG - FIXING CONNECTION ERROR!\n');
  
  // Test 1: Check if backend is actually running
  console.log('🔍 Test 1: Backend Status Check');
  await testBackendStatus();
  
  // Test 2: Test exact API call that frontend makes
  console.log('\n🔍 Test 2: Exact Frontend API Call');
  await testExactAPICall();
  
  // Test 3: Check if there's a DNS/SSL issue
  console.log('\n🔍 Test 3: DNS/SSL Check');
  await testDNSSSL();
  
  // Test 4: Try alternative connection methods
  console.log('\n🔍 Test 4: Alternative Connection Methods');
  await testAlternativeConnections();
  
  console.log('\n🚨 EMERGENCY DIAGNOSIS COMPLETE!');
}

async function testBackendStatus() {
  const urls = [
    'https://dihhjbitchin-backend.onrender.com/health',
    'https://dihhjbitchin-backend.onrender.com/tea/list',
    'https://dihhjbitchin-ido5.onrender.com/health'
  ];
  
  for (const url of urls) {
    await new Promise((resolve) => {
      console.log(`   Testing: ${url}`);
      const req = https.get(url, (res) => {
        console.log(`     ✅ Status: ${res.statusCode} - ${res.statusMessage}`);
        resolve();
      });
      
      req.on('error', (error) => {
        console.log(`     ❌ ERROR: ${error.code} - ${error.message}`);
        resolve();
      });
      
      req.setTimeout(5000, () => {
        console.log(`     ⏰ TIMEOUT`);
        req.destroy();
        resolve();
      });
    });
  }
}

async function testExactAPICall() {
  return new Promise((resolve) => {
    const options = {
      hostname: 'dihhjbitchin-backend.onrender.com',
      path: '/tea/list',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Origin': 'https://dihhjbitchin-ido5.onrender.com',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 15000
    };
    
    console.log('   Making exact API call with headers:', JSON.stringify(options.headers, null, 2));
    
    const req = https.request(options, (res) => {
      console.log(`   ✅ Response Status: ${res.statusCode}`);
      console.log(`   ✅ Response Headers:`, res.headers);
      
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          console.log(`   ✅ SUCCESS: Found ${json.teas ? json.teas.length : 0} tea posts`);
        } catch (e) {
          console.log(`   ⚠️ Response not JSON: ${data.substring(0, 100)}...`);
        }
        resolve();
      });
    });
    
    req.on('error', (error) => {
      console.log(`   ❌ REQUEST ERROR: ${error.code} - ${error.message}`);
      console.log(`   ❌ Error details:`, error);
      resolve();
    });
    
    req.on('timeout', () => {
      console.log(`   ⏰ REQUEST TIMEOUT`);
      req.destroy();
      resolve();
    });
    
    req.end();
  });
}

async function testDNSSSL() {
  const { exec } = require('child_process');
  
  return new Promise((resolve) => {
    console.log('   Testing DNS resolution...');
    exec('nslookup dihhjbitchin-backend.onrender.com', (error, stdout, stderr) => {
      if (error) {
        console.log(`   ❌ DNS Error: ${error.message}`);
      } else {
        console.log(`   ✅ DNS Resolution: OK`);
        console.log(`   DNS Output: ${stdout.split('\n')[0]}`);
      }
      resolve();
    });
  });
}

async function testAlternativeConnections() {
  // Test with different user agents and headers
  const testConfigs = [
    {
      name: 'Simple GET',
      headers: { 'Accept': 'application/json' }
    },
    {
      name: 'Browser-like',
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept-Language': 'en-US,en;q=0.9'
      }
    },
    {
      name: 'CORS Preflight',
      method: 'OPTIONS',
      headers: {
        'Origin': 'https://dihhjbitchin-ido5.onrender.com',
        'Access-Control-Request-Method': 'GET'
      }
    }
  ];
  
  for (const config of testConfigs) {
    await new Promise((resolve) => {
      console.log(`   Testing ${config.name}...`);
      
      const options = {
        hostname: 'dihhjbitchin-backend.onrender.com',
        path: '/tea/list',
        method: config.method || 'GET',
        headers: config.headers
      };
      
      const req = https.request(options, (res) => {
        console.log(`     ✅ ${config.name}: Status ${res.statusCode}`);
        resolve();
      });
      
      req.on('error', (error) => {
        console.log(`     ❌ ${config.name}: ${error.message}`);
        resolve();
      });
      
      req.setTimeout(5000, () => {
        console.log(`     ⏰ ${config.name}: Timeout`);
        req.destroy();
        resolve();
      });
      
      req.end();
    });
  }
}

emergencyDebug().catch(console.error);

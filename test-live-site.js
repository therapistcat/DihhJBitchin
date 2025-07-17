const https = require('https');

async function testLiveSite() {
  console.log('🌐 TESTING LIVE SITE AFTER FIXES...\n');
  
  // Test 1: Frontend loads
  console.log('🔍 Test 1: Frontend Loading');
  const frontendResult = await testEndpoint('https://dihhjbitchin-ido5.onrender.com');
  
  // Test 2: Backend API responds
  console.log('\n🔍 Test 2: Backend API Health');
  const backendResult = await testEndpoint('https://dihhjbitchin-backend.onrender.com/health');
  
  // Test 3: Tea API works
  console.log('\n🔍 Test 3: Tea API');
  const teaResult = await testEndpoint('https://dihhjbitchin-backend.onrender.com/tea/list');
  
  // Test 4: CORS test with frontend origin
  console.log('\n🔍 Test 4: CORS from Frontend');
  const corsResult = await testCORS();
  
  // Final verdict
  console.log('\n' + '='.repeat(60));
  if (frontendResult.success && backendResult.success && teaResult.success && corsResult.success) {
    console.log('🎉 ALL TESTS PASSED! 🎉');
    console.log('\n✅ Your site should now work without network errors!');
    console.log('✅ Frontend: https://dihhjbitchin-ido5.onrender.com');
    console.log('✅ Backend: https://dihhjbitchin-backend.onrender.com');
    console.log('✅ No more auto-refresh issues');
    console.log('✅ Tea posts should load properly');
    console.log('\n🚀 The network error should be FIXED!');
  } else {
    console.log('❌ SOME TESTS FAILED');
    console.log('   Check the individual test results above');
  }
  console.log('='.repeat(60));
}

async function testEndpoint(url) {
  return new Promise((resolve) => {
    const req = https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log(`   ✅ SUCCESS (${res.statusCode})`);
          
          // Special handling for tea API
          if (url.includes('/tea/list')) {
            try {
              const json = JSON.parse(data);
              console.log(`   📊 Found ${json.teas ? json.teas.length : 0} tea posts`);
            } catch (e) {
              console.log('   ⚠️ Response parsing failed');
            }
          }
          
          resolve({ success: true, status: res.statusCode });
        } else {
          console.log(`   ❌ FAILED (${res.statusCode})`);
          resolve({ success: false, status: res.statusCode });
        }
      });
    });
    
    req.on('error', (error) => {
      console.log(`   ❌ ERROR: ${error.message}`);
      resolve({ success: false, error: error.message });
    });
    
    req.setTimeout(10000, () => {
      console.log(`   ⏰ TIMEOUT`);
      req.destroy();
      resolve({ success: false, error: 'Timeout' });
    });
  });
}

async function testCORS() {
  return new Promise((resolve) => {
    const options = {
      hostname: 'dihhjbitchin-backend.onrender.com',
      path: '/tea/list',
      method: 'GET',
      headers: {
        'Origin': 'https://dihhjbitchin-ido5.onrender.com',
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    };
    
    const req = https.request(options, (res) => {
      const corsHeader = res.headers['access-control-allow-origin'];
      if (corsHeader && (corsHeader === '*' || corsHeader.includes('dihhjbitchin-ido5'))) {
        console.log('   ✅ CORS headers correct');
        console.log(`   📡 Access-Control-Allow-Origin: ${corsHeader}`);
        resolve({ success: true });
      } else {
        console.log('   ❌ CORS headers missing or incorrect');
        console.log(`   📡 Got: ${corsHeader}`);
        resolve({ success: false });
      }
    });
    
    req.on('error', (error) => {
      console.log(`   ❌ CORS test error: ${error.message}`);
      resolve({ success: false });
    });
    
    req.setTimeout(5000, () => {
      console.log(`   ⏰ CORS test timeout`);
      req.destroy();
      resolve({ success: false });
    });
    
    req.end();
  });
}

testLiveSite().catch(console.error);

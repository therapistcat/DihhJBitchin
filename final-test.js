const https = require('https');

async function finalTest() {
  console.log('🚀 FINAL DihhJ Bitchers Test\n');
  console.log('='.repeat(50));
  
  console.log('\n📍 CORRECT URL CONFIGURATION:');
  console.log('   Frontend: https://dihhjbitchin-ido5.onrender.com');
  console.log('   Backend:  https://dihhjbitchin-backend.onrender.com');
  
  let allTestsPassed = true;
  
  // Test 1: Backend Health
  console.log('\n🔍 Test 1: Backend Health Check');
  const healthResult = await testEndpoint('https://dihhjbitchin-backend.onrender.com/health');
  if (!healthResult.success) allTestsPassed = false;
  
  // Test 2: Tea API
  console.log('\n🔍 Test 2: Tea Posts API');
  const teaResult = await testEndpoint('https://dihhjbitchin-backend.onrender.com/tea/list');
  if (!teaResult.success) allTestsPassed = false;
  
  // Test 3: Frontend Loading
  console.log('\n🔍 Test 3: Frontend Loading');
  const frontendResult = await testEndpoint('https://dihhjbitchin-ido5.onrender.com');
  if (!frontendResult.success) allTestsPassed = false;
  
  // Test 4: CORS Headers
  console.log('\n🔍 Test 4: CORS Configuration');
  const corsResult = await testCORS();
  if (!corsResult.success) allTestsPassed = false;
  
  // Final Result
  console.log('\n' + '='.repeat(50));
  if (allTestsPassed) {
    console.log('🎉 ALL TESTS PASSED! 🎉');
    console.log('\n✅ Your DihhJ Bitchers site should now work properly:');
    console.log('   ✅ No more auto-refresh issues');
    console.log('   ✅ Tea posts should load correctly');
    console.log('   ✅ Backend connection is working');
    console.log('   ✅ CORS is configured properly');
    console.log('\n🌐 Visit: https://dihhjbitchin-ido5.onrender.com');
  } else {
    console.log('❌ SOME TESTS FAILED');
    console.log('   Check the errors above for details');
  }
  console.log('='.repeat(50));
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
        'Access-Control-Request-Method': 'GET'
      }
    };
    
    const req = https.request(options, (res) => {
      const corsHeader = res.headers['access-control-allow-origin'];
      if (corsHeader && (corsHeader === '*' || corsHeader.includes('dihhjbitchin-ido5'))) {
        console.log('   ✅ CORS headers present and correct');
        resolve({ success: true });
      } else {
        console.log('   ⚠️ CORS headers missing or incorrect');
        console.log(`   Expected: *dihhjbitchin-ido5*, Got: ${corsHeader}`);
        resolve({ success: false });
      }
    });
    
    req.on('error', (error) => {
      console.log(`   ❌ CORS test error: ${error.message}`);
      resolve({ success: false });
    });
    
    req.end();
  });
}

finalTest().catch(console.error);

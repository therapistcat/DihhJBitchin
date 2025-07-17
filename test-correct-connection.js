const https = require('https');

async function testConnection() {
  console.log('🚀 Testing CORRECT DihhJ Connection...\n');
  
  // Test frontend -> backend connection
  console.log('🔍 Testing Frontend to Backend Connection:');
  console.log('   Frontend: https://dihhjbitchin-ido5.onrender.com');
  console.log('   Backend:  https://dihhjbitchin-backend.onrender.com\n');
  
  // Test backend API endpoints
  const endpoints = [
    '/health',
    '/tea/list',
    '/tea/tags',
    '/tea/batches'
  ];
  
  for (const endpoint of endpoints) {
    await testEndpoint(`https://dihhjbitchin-backend.onrender.com${endpoint}`, `Backend ${endpoint}`);
  }
  
  // Test if frontend loads
  await testEndpoint('https://dihhjbitchin-ido5.onrender.com', 'Frontend');
  
  console.log('\n🎯 Connection test completed!');
}

async function testEndpoint(url, name) {
  return new Promise((resolve) => {
    console.log(`\n🔍 Testing ${name}: ${url}`);
    
    const req = https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log(`✅ ${name} - SUCCESS (${res.statusCode})`);
          if (name.includes('tea/list')) {
            try {
              const json = JSON.parse(data);
              console.log(`   Found ${json.teas ? json.teas.length : 0} tea posts`);
            } catch (e) {
              console.log('   Response parsing failed');
            }
          }
        } else {
          console.log(`❌ ${name} - FAILED (${res.statusCode})`);
        }
        resolve();
      });
    });
    
    req.on('error', (error) => {
      console.log(`❌ ${name} - ERROR: ${error.message}`);
      resolve();
    });
    
    req.setTimeout(10000, () => {
      console.log(`⏰ ${name} - TIMEOUT`);
      req.destroy();
      resolve();
    });
  });
}

testConnection().catch(console.error);

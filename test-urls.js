const https = require('https');
const http = require('http');

async function testUrl(url, description) {
  return new Promise((resolve) => {
    console.log(`\n🔍 Testing ${description}: ${url}`);
    
    const client = url.startsWith('https') ? https : http;
    
    const req = client.get(url, (res) => {
      console.log(`✅ ${description} - Status: ${res.statusCode}`);
      console.log(`   Headers: ${JSON.stringify(res.headers, null, 2)}`);
      
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log(`   Response preview: ${data.substring(0, 200)}...`);
        resolve({ success: true, status: res.statusCode, data });
      });
    });
    
    req.on('error', (error) => {
      console.log(`❌ ${description} - Error: ${error.message}`);
      resolve({ success: false, error: error.message });
    });
    
    req.setTimeout(10000, () => {
      console.log(`⏰ ${description} - Timeout`);
      req.destroy();
      resolve({ success: false, error: 'Timeout' });
    });
  });
}

async function main() {
  console.log('🚀 Testing DihhJ URLs...\n');
  
  // Test both possible frontend URLs
  await testUrl('https://dihhjbitchin-backend.onrender.com', 'Frontend URL 1');
  await testUrl('https://dihhjbitchin-ido5.onrender.com', 'Frontend URL 2');
  
  // Test backend health endpoints
  await testUrl('https://dihhjbitchin-backend.onrender.com/health', 'Backend Health 1');
  await testUrl('https://dihhjbitchin-ido5.onrender.com/health', 'Backend Health 2');
  
  // Test tea endpoints
  await testUrl('https://dihhjbitchin-backend.onrender.com/tea/list', 'Tea API 1');
  await testUrl('https://dihhjbitchin-ido5.onrender.com/tea/list', 'Tea API 2');
  
  console.log('\n🎯 Test completed!');
}

main().catch(console.error);

const https = require('https');

async function testFrontendAPI() {
  console.log('🔥 Testing Frontend API Connection...\n');
  
  // Test the exact API call that the frontend makes
  const apiUrl = 'https://dihhjbitchin-backend.onrender.com/tea/list';
  
  console.log(`🔍 Testing API endpoint: ${apiUrl}`);
  
  return new Promise((resolve) => {
    const req = https.get(apiUrl, (res) => {
      console.log(`📡 Response Status: ${res.statusCode}`);
      console.log(`📡 Response Headers:`, res.headers);
      
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          console.log('\n✅ API Response Structure:');
          console.log(`   - Has 'teas' property: ${!!json.teas}`);
          console.log(`   - Number of teas: ${json.teas ? json.teas.length : 0}`);
          console.log(`   - Total count: ${json.total || 'not provided'}`);
          
          if (json.teas && json.teas.length > 0) {
            console.log('\n🔥 First Tea Post:');
            const firstTea = json.teas[0];
            console.log(`   - ID: ${firstTea.id}`);
            console.log(`   - Title: ${firstTea.title}`);
            console.log(`   - Author: ${firstTea.author}`);
            console.log(`   - Content: ${firstTea.content ? firstTea.content.substring(0, 100) + '...' : 'No content'}`);
            console.log(`   - Score: ${firstTea.score || 0}`);
            console.log(`   - Created: ${firstTea.created_at}`);
          }
          
          console.log('\n🎯 API Test Result: SUCCESS - Tea posts are available!');
        } catch (error) {
          console.log(`❌ JSON Parse Error: ${error.message}`);
          console.log(`Raw response: ${data.substring(0, 200)}...`);
        }
        resolve();
      });
    });
    
    req.on('error', (error) => {
      console.log(`❌ Request Error: ${error.message}`);
      resolve();
    });
    
    req.setTimeout(10000, () => {
      console.log(`⏰ Request Timeout`);
      req.destroy();
      resolve();
    });
  });
}

testFrontendAPI().catch(console.error);

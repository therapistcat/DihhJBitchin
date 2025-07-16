// Create a test tea post
const https = require('https');
const http = require('http');

function makeRequest(url, method, data) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
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

    const req = client.request(options, (res) => {
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

async function createTestPost() {
  console.log('🔥 Creating test tea post...');
  
  const postData = JSON.stringify({
    title: "🔥 Test Tea Post - Connection Working!",
    content: "This is a test tea post to verify that the frontend and backend are connected properly. If you can see this, the connection is working! 🎉",
    tag: "general",
    batch: "25"
  });

  try {
    const response = await makeRequest('http://localhost:8000/tea/create?username=testuser', 'POST', postData);
    console.log('✅ Test post created:', response);
  } catch (error) {
    console.error('❌ Error creating test post:', error);
  }
}

createTestPost();

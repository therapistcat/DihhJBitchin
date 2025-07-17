import React, { useState, useEffect } from 'react';

const APITest = () => {
  const [testResults, setTestResults] = useState({
    health: 'Testing...',
    teaList: 'Testing...',
    directFetch: 'Testing...'
  });

  useEffect(() => {
    const runTests = async () => {
      const apiUrl = process.env.REACT_APP_API_URL || 'https://dihhjbitchin-backend.onrender.com';

      // Test 1: Health check
      try {
        const healthResponse = await fetch(`${apiUrl}/health`);
        if (healthResponse.ok) {
          const healthData = await healthResponse.json();
          setTestResults(prev => ({ ...prev, health: `✅ Health OK: ${healthData.message}` }));
        } else {
          setTestResults(prev => ({ ...prev, health: `❌ Health failed: ${healthResponse.status}` }));
        }
      } catch (error) {
        setTestResults(prev => ({ ...prev, health: `❌ Health error: ${error.message}` }));
      }

      // Test 2: Tea list
      try {
        const teaResponse = await fetch(`${apiUrl}/tea/list`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          mode: 'cors',
        });
        
        if (teaResponse.ok) {
          const teaData = await teaResponse.json();
          setTestResults(prev => ({ 
            ...prev, 
            teaList: `✅ Tea list OK: ${teaData.teas?.length || 0} posts found` 
          }));
        } else {
          const errorText = await teaResponse.text();
          setTestResults(prev => ({ 
            ...prev, 
            teaList: `❌ Tea list failed: ${teaResponse.status} - ${errorText}` 
          }));
        }
      } catch (error) {
        setTestResults(prev => ({ ...prev, teaList: `❌ Tea list error: ${error.message}` }));
      }

      // Test 3: Direct fetch with all headers
      try {
        const directResponse = await fetch(`${apiUrl}/tea/list`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Origin': 'http://localhost:3000',
          },
          mode: 'cors',
          credentials: 'omit',
        });
        
        if (directResponse.ok) {
          const directData = await directResponse.json();
          setTestResults(prev => ({ 
            ...prev, 
            directFetch: `✅ Direct fetch OK: ${directData.teas?.length || 0} posts` 
          }));
        } else {
          setTestResults(prev => ({ 
            ...prev, 
            directFetch: `❌ Direct fetch failed: ${directResponse.status}` 
          }));
        }
      } catch (error) {
        setTestResults(prev => ({ ...prev, directFetch: `❌ Direct fetch error: ${error.message}` }));
      }
    };

    runTests();
  }, []);

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      background: '#000',
      color: '#fff',
      padding: '15px',
      borderRadius: '8px',
      fontSize: '12px',
      fontFamily: 'monospace',
      zIndex: 9999,
      maxWidth: '400px',
      border: '2px solid #ff4444'
    }}>
      <h3 style={{ margin: '0 0 10px 0', color: '#ff4444' }}>🔥 API Test Results</h3>
      <div><strong>Health Check:</strong> {testResults.health}</div>
      <div><strong>Tea List:</strong> {testResults.teaList}</div>
      <div><strong>Direct Fetch:</strong> {testResults.directFetch}</div>
      <div style={{ marginTop: '10px', fontSize: '10px', color: '#888' }}>
        API URL: {process.env.REACT_APP_API_URL || 'https://dihhjbitchin-backend.onrender.com'}
      </div>
    </div>
  );
};

export default APITest;

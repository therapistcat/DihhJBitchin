import React, { useState, useEffect } from 'react';
import { teaAPI } from '../../services/api';

const ConnectionTest = () => {
  const [status, setStatus] = useState('Testing...');
  const [results, setResults] = useState([]);

  const addResult = (test, success, message, data = null) => {
    setResults(prev => [...prev, { test, success, message, data, timestamp: new Date().toLocaleTimeString() }]);
  };

  const testConnection = async () => {
    setResults([]);
    setStatus('Running connection tests...');

    console.log('🔗 Starting connection test from React component...');

    try {
      // Test 1: Basic fetch to local backend
      addResult('Basic Fetch Test', false, 'Testing basic fetch to local backend...');
      try {
        console.log('Making fetch request to http://localhost:8000/health');
        const response = await fetch('http://localhost:8000/health', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        console.log('Fetch response:', response);
        const data = await response.json();
        console.log('Fetch data:', data);
        addResult('Basic Fetch Test', true, 'Basic fetch working', data);
      } catch (fetchError) {
        console.error('Fetch error:', fetchError);
        addResult('Basic Fetch Test', false, `Fetch failed: ${fetchError.message}`, fetchError);
      }

      // Test 2: API service test
      addResult('API Service Test', false, 'Testing API service...');
      try {
        console.log('Testing API service...');
        const teaResponse = await teaAPI.getTeaPosts();
        console.log('API service response:', teaResponse);
        addResult('API Service Test', true, 'API service working', teaResponse);
      } catch (apiError) {
        console.error('API service error:', apiError);
        addResult('API Service Test', false, `API service failed: ${apiError.message}`, apiError);
      }

      setStatus('✅ Connection tests completed!');
    } catch (error) {
      console.error('Overall test error:', error);
      addResult('Connection Test', false, `Error: ${error.message}`, error);
      setStatus('❌ Connection test failed. Check console for details.');
    }
  };

  useEffect(() => {
    testConnection();
  }, []);

  return (
    <div style={{ 
      padding: '20px', 
      margin: '20px', 
      border: '2px solid #333', 
      borderRadius: '8px',
      backgroundColor: '#1a1a1a',
      color: '#fff'
    }}>
      <h2>🔗 Frontend-Backend Connection Test</h2>
      <p><strong>Status:</strong> {status}</p>
      
      <button 
        onClick={testConnection}
        style={{
          padding: '10px 20px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          marginBottom: '20px'
        }}
      >
        Run Test Again
      </button>

      <div>
        <h3>Test Results:</h3>
        {results.map((result, index) => (
          <div 
            key={index} 
            style={{ 
              margin: '10px 0', 
              padding: '10px',
              backgroundColor: result.success ? '#1a4a1a' : '#4a1a1a',
              borderRadius: '4px',
              borderLeft: `4px solid ${result.success ? '#28a745' : '#dc3545'}`
            }}
          >
            <strong>{result.test}</strong> - {result.timestamp}
            <br />
            <span style={{ color: result.success ? '#90ee90' : '#ffcccb' }}>
              {result.message}
            </span>
            {result.data && (
              <details style={{ marginTop: '5px' }}>
                <summary>View Data</summary>
                <pre style={{ fontSize: '12px', overflow: 'auto' }}>
                  {JSON.stringify(result.data, null, 2)}
                </pre>
              </details>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ConnectionTest;

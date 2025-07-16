#!/usr/bin/env node

/**
 * Test script to verify frontend-backend connection
 * Run with: node test-frontend-backend-connection.js
 */

const https = require('https');
const http = require('http');

const BACKEND_URL = 'https://dihhjbitchin-backend.onrender.com';
const FRONTEND_URL = 'https://dihhjbitchin-ido5.onrender.com';

// Helper function to make HTTP requests
function makeRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
        const protocol = url.startsWith('https') ? https : http;
        const requestOptions = {
            method: options.method || 'GET',
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'DihhJ-Test-Script',
                ...options.headers
            }
        };

        const req = protocol.request(url, requestOptions, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const jsonData = JSON.parse(data);
                    resolve({ 
                        success: res.statusCode >= 200 && res.statusCode < 300,
                        status: res.statusCode,
                        data: jsonData,
                        headers: res.headers
                    });
                } catch (e) {
                    resolve({ 
                        success: res.statusCode >= 200 && res.statusCode < 300,
                        status: res.statusCode,
                        data: data,
                        headers: res.headers
                    });
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        if (options.body) {
            req.write(JSON.stringify(options.body));
        }

        req.end();
    });
}

// Test functions
async function testBackendHealth() {
    console.log('\n🔍 Testing Backend Health...');
    try {
        const response = await makeRequest(`${BACKEND_URL}/health`);
        if (response.success) {
            console.log('✅ Backend is healthy!');
            console.log('   Response:', JSON.stringify(response.data, null, 2));
            return true;
        } else {
            console.log('❌ Backend health check failed');
            console.log('   Status:', response.status);
            console.log('   Response:', response.data);
            return false;
        }
    } catch (error) {
        console.log('❌ Backend health check error:', error.message);
        return false;
    }
}

async function testBackendEndpoints() {
    console.log('\n🔍 Testing Backend API Endpoints...');
    
    const endpoints = [
        { path: '/', name: 'Root' },
        { path: '/tea/list', name: 'Tea List' },
        { path: '/tea/tags', name: 'Tea Tags' },
        { path: '/tea/batches', name: 'Tea Batches' }
    ];

    let passedTests = 0;
    
    for (const endpoint of endpoints) {
        try {
            console.log(`\n   Testing ${endpoint.name} (${endpoint.path})...`);
            const response = await makeRequest(`${BACKEND_URL}${endpoint.path}`);
            
            if (response.success) {
                console.log(`   ✅ ${endpoint.name} - OK`);
                passedTests++;
            } else {
                console.log(`   ❌ ${endpoint.name} - Failed (Status: ${response.status})`);
                console.log(`      Response:`, response.data);
            }
        } catch (error) {
            console.log(`   ❌ ${endpoint.name} - Error:`, error.message);
        }
    }
    
    console.log(`\n📊 Endpoint Tests: ${passedTests}/${endpoints.length} passed`);
    return passedTests === endpoints.length;
}

async function testCORS() {
    console.log('\n🔍 Testing CORS Configuration...');
    try {
        const response = await makeRequest(`${BACKEND_URL}/health`, {
            headers: {
                'Origin': FRONTEND_URL,
                'Access-Control-Request-Method': 'GET'
            }
        });
        
        const corsHeaders = response.headers['access-control-allow-origin'];
        if (corsHeaders) {
            console.log('✅ CORS headers present');
            console.log('   Access-Control-Allow-Origin:', corsHeaders);
            return true;
        } else {
            console.log('❌ CORS headers missing');
            return false;
        }
    } catch (error) {
        console.log('❌ CORS test error:', error.message);
        return false;
    }
}

async function testFrontendAccess() {
    console.log('\n🔍 Testing Frontend Access...');
    try {
        const response = await makeRequest(FRONTEND_URL);
        if (response.success) {
            console.log('✅ Frontend is accessible');
            return true;
        } else {
            console.log('❌ Frontend access failed');
            console.log('   Status:', response.status);
            return false;
        }
    } catch (error) {
        console.log('❌ Frontend access error:', error.message);
        return false;
    }
}

// Main test runner
async function runTests() {
    console.log('🚀 DihhJ Frontend-Backend Connection Test');
    console.log('==========================================');
    console.log(`Backend URL: ${BACKEND_URL}`);
    console.log(`Frontend URL: ${FRONTEND_URL}`);
    
    const tests = [
        { name: 'Backend Health', fn: testBackendHealth },
        { name: 'Backend Endpoints', fn: testBackendEndpoints },
        { name: 'CORS Configuration', fn: testCORS },
        { name: 'Frontend Access', fn: testFrontendAccess }
    ];
    
    let passedTests = 0;
    
    for (const test of tests) {
        try {
            const result = await test.fn();
            if (result) passedTests++;
        } catch (error) {
            console.log(`❌ ${test.name} test failed:`, error.message);
        }
    }
    
    console.log('\n📊 Final Results');
    console.log('================');
    console.log(`Tests passed: ${passedTests}/${tests.length}`);
    
    if (passedTests === tests.length) {
        console.log('🎉 All tests passed! Frontend and backend should be connected.');
    } else {
        console.log('⚠️  Some tests failed. Check the issues above.');
        
        console.log('\n🔧 Troubleshooting Tips:');
        console.log('1. Make sure the backend is deployed with the latest code');
        console.log('2. Check that CORS is configured correctly in the backend');
        console.log('3. Verify the frontend is using the correct API URL');
        console.log('4. Check browser console for any CORS or network errors');
    }
}

// Run the tests
runTests().catch(console.error);

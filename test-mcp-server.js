// MCP Server Tools Lister
const http = require('http');

console.log('🔍 MCP Server Information');
console.log('========================');
console.log('Server: http://localhost:8080');
console.log('Type: HTTP');
console.log('');

function testMcpServer() {
  // Test 1: Check if server is responding
  console.log('1️⃣ Testing server connectivity...');
  
  const data = JSON.stringify({
    jsonrpc: "2.0",
    id: 1,
    method: "tools/list",
    params: {}
  });

  const options = {
    hostname: 'localhost',
    port: 8080,
    path: '/',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(data)
    }
  };

  const req = http.request(options, (res) => {
    console.log(`📊 Status: ${res.statusCode}`);
    
    let responseData = '';
    res.on('data', (chunk) => {
      responseData += chunk;
    });

    res.on('end', () => {
      try {
        const parsed = JSON.parse(responseData);
        
        if (parsed.result && parsed.result.tools) {
          console.log('✅ MCP Server is working!');
          console.log('');
          console.log('🛠️ Available Tools:');
          console.log('==================');
          
          parsed.result.tools.forEach((tool, index) => {
            console.log(`${index + 1}. ${tool.name}`);
            console.log(`   📝 ${tool.description}`);
            
            if (tool.inputSchema && tool.inputSchema.properties) {
              const props = Object.keys(tool.inputSchema.properties);
              console.log(`   📋 Parameters: ${props.join(', ')}`);
            }
            
            if (tool.inputSchema && tool.inputSchema.required) {
              console.log(`   ⚠️ Required: ${tool.inputSchema.required.join(', ')}`);
            }
            console.log('');
          });
          
          console.log(`📊 Total: ${parsed.result.tools.length} tools available`);
        } else if (parsed.error) {
          console.log('❌ MCP Error:', parsed.error.message);
        } else {
          console.log('⚠️ Unexpected response format');
          console.log('Response:', JSON.stringify(parsed, null, 2));
        }
      } catch (error) {
        console.log('❌ Server responded but not with valid JSON-RPC');
        console.log('Response was:', responseData.substring(0, 200) + '...');
        
        // Try to determine what kind of server this is
        if (responseData.includes('<!DOCTYPE html>')) {
          console.log('💡 This appears to be a web server, not an MCP server');
        } else if (responseData.includes('Cannot POST')) {
          console.log('💡 Server doesn\'t handle POST requests at root path');
        }
      }
    });
  });

  req.on('error', (error) => {
    console.log('❌ Connection failed:', error.message);
    console.log('💡 Make sure MCP server is running on port 8080');
  });

  req.setTimeout(5000);
  req.write(data);
  req.end();
}

// Test 2: Try health check endpoint
function testHealthEndpoint() {
  console.log('2️⃣ Testing health endpoint...');
  
  const options = {
    hostname: 'localhost',
    port: 8080,
    path: '/health',
    method: 'GET'
  };

  const req = http.request(options, (res) => {
    console.log(`📊 Health Status: ${res.statusCode}`);
    
    let responseData = '';
    res.on('data', (chunk) => {
      responseData += chunk;
    });

    res.on('end', () => {
      console.log('Health Response:', responseData);
      console.log('');
      
      // Now test the tools endpoint
      testMcpServer();
    });
  });

  req.on('error', (error) => {
    console.log('⚠️ No health endpoint available');
    console.log('');
    
    // Still try the main MCP test
    testMcpServer();
  });

  req.setTimeout(3000);
  req.end();
}

// Start tests
testHealthEndpoint();

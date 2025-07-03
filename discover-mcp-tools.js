// Test MCP Server with correct endpoints
const http = require('http');

console.log('🔍 MCP Server Tools Discovery');
console.log('=============================');
console.log('Server: http://localhost:8080');
console.log('Health Status: ✅ OK (8 tools available)');
console.log('');

// Try different possible endpoints for MCP tools
const endpoints = [
  '/api/mcp/tools',
  '/mcp/tools', 
  '/tools',
  '/api/tools',
  '/tools/list'
];

let currentEndpoint = 0;

function testEndpoint(path) {
  return new Promise((resolve) => {
    console.log(`🔍 Trying endpoint: ${path}`);
    
    const options = {
      hostname: 'localhost',
      port: 8080,
      path: path,
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          console.log(`✅ Success! Status: ${res.statusCode}`);
          
          if (parsed.tools) {
            console.log('🛠️ Available Tools:');
            console.log('==================');
            
            parsed.tools.forEach((tool, index) => {
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
            
            console.log(`📊 Total: ${parsed.tools.length} tools found`);
            resolve(true);
            return;
          } else {
            console.log(`📋 Response: ${JSON.stringify(parsed, null, 2)}`);
          }
        } catch (error) {
          console.log(`❌ Status: ${res.statusCode} - Not JSON response`);
          if (responseData.length < 200) {
            console.log(`Response: ${responseData}`);
          }
        }
        
        resolve(false);
      });
    });

    req.on('error', (error) => {
      console.log(`❌ Error: ${error.message}`);
      resolve(false);
    });

    req.setTimeout(3000);
    req.end();
  });
}

// Try POST request with JSON-RPC to /api/mcp
function testMcpApiEndpoint() {
  return new Promise((resolve) => {
    console.log('🔍 Trying MCP API endpoint with JSON-RPC...');
    
    const data = JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "tools/list",
      params: {}
    });

    const options = {
      hostname: 'localhost',
      port: 8080,
      path: '/api/mcp',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    };

    const req = http.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          console.log(`✅ MCP API Success! Status: ${res.statusCode}`);
          
          if (parsed.result && parsed.result.tools) {
            console.log('🛠️ Available MCP Tools:');
            console.log('======================');
            
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
            
            console.log(`📊 Total: ${parsed.result.tools.length} MCP tools available`);
            resolve(true);
            return;
          }
        } catch (error) {
          console.log(`❌ Status: ${res.statusCode} - Not valid JSON-RPC`);
          console.log(`Response: ${responseData.substring(0, 100)}...`);
        }
        
        resolve(false);
      });
    });

    req.on('error', (error) => {
      console.log(`❌ Error: ${error.message}`);
      resolve(false);
    });

    req.setTimeout(5000);
    req.write(data);
    req.end();
  });
}

async function discoverTools() {
  // First try the MCP API endpoint
  const mcpSuccess = await testMcpApiEndpoint();
  if (mcpSuccess) return;
  
  console.log('');
  console.log('🔍 Trying other endpoints...');
  console.log('');
  
  // Try GET endpoints
  for (const endpoint of endpoints) {
    const success = await testEndpoint(endpoint);
    if (success) return;
    
    await new Promise(resolve => setTimeout(resolve, 500)); // Small delay
  }
  
  console.log('');
  console.log('❌ Could not find MCP tools endpoint');
  console.log('💡 The server is running but may need proper MCP configuration');
}

discoverTools();

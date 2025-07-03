// services/mcpClient.ts

// Interface for tool call request
interface ToolCallRequest {
  tool: string;
  input: any;
}

// Function to call MCP tools using the /tools endpoint
export async function callMcpTool(tool: string, input: any) {
  const request: ToolCallRequest = {
    tool: tool,
    input: input
  };

  const response = await fetch('http://localhost:8080/call-tool', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(`MCP server error: ${response.status} ${response.statusText}`);
  }

  return await response.json();
}

// Function to list available MCP tools
export async function listMcpTools() {
  const response = await fetch('http://localhost:8080/tools', {
    method: 'GET',
    headers: { 'Accept': 'application/json' }
  });

  if (!response.ok) {
    throw new Error(`MCP server error: ${response.status} ${response.statusText}`);
  }

  const result = await response.json();
  return result.tools || [];
}

// Function to test MCP server connection
export async function pingMcpServer() {
  const response = await fetch('http://localhost:8080/health', {
    method: 'GET'
  });

  if (!response.ok) {
    throw new Error(`Health check failed: ${response.status} ${response.statusText}`);
  }

  return await response.json();
}

// Test script to check backend connectivity
const testBackendConnection = async () => {
  console.log('🔄 Testing backend connection...');
  
  try {
    // Test 1: Simple health check
    console.log('Test 1: Health check...');
    const healthResponse = await fetch('http://localhost:8082/actuator/health');
    if (healthResponse.ok) {
      console.log('✅ Health check passed');
      const healthData = await healthResponse.json();
      console.log('Health data:', healthData);
    } else {
      console.log('❌ Health check failed:', healthResponse.status);
    }
  } catch (error) {
    console.log('❌ Health check error:', error.message);
  }

  try {
    // Test 2: Simple ping
    console.log('Test 2: Simple ping...');
    const pingResponse = await fetch('http://localhost:8082/api/ping');
    if (pingResponse.ok) {
      console.log('✅ Ping successful');
      const pingData = await pingResponse.text();
      console.log('Ping response:', pingData);
    } else {
      console.log('❌ Ping failed:', pingResponse.status);
    }
  } catch (error) {
    console.log('❌ Ping error:', error.message);
  }

  try {
    // Test 3: Test posts endpoint
    console.log('Test 3: Testing posts endpoint...');
    const postsResponse = await fetch('http://localhost:8082/api/posts');
    if (postsResponse.ok) {
      console.log('✅ Posts endpoint accessible');
      const postsData = await postsResponse.json();
      console.log('Posts data:', postsData);
    } else {
      console.log('❌ Posts endpoint failed:', postsResponse.status);
      const errorText = await postsResponse.text();
      console.log('Error response:', errorText);
    }
  } catch (error) {
    console.log('❌ Posts endpoint error:', error.message);
  }

  try {
    // Test 4: Test CORS by attempting to create a post
    console.log('Test 4: Testing POST request...');
    const postResponse = await fetch('http://localhost:8082/api/posts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content: 'Test post from frontend',
        author: 'Test User',
        userId: 1
      })
    });
    
    if (postResponse.ok) {
      console.log('✅ POST request successful');
      const postData = await postResponse.json();
      console.log('Created post:', postData);
    } else {
      console.log('❌ POST request failed:', postResponse.status);
      const errorText = await postResponse.text();
      console.log('Error response:', errorText);
    }
  } catch (error) {
    console.log('❌ POST request error:', error.message);
  }
};

// Run the test
testBackendConnection();

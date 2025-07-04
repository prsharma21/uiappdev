/**
 * API Service for connecting to Spring Boot backend
 * Backend URL: http://localhost:8082
 */

const API_BASE_URL = 'http://localhost:8082';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Generic request method
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Add authentication token if available
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, config);
      
      // Handle non-JSON responses
      const contentType = response.headers.get('content-type');
      let data;
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      if (!response.ok) {
        throw new Error(data.message || data || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // GET request
  async get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  }

  // POST request
  async post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // PUT request
  async put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // DELETE request
  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }

  // Authentication endpoints
  async login(credentials) {
    try {
      console.log('🔄 Attempting login to backend...');
      const response = await this.post('/api/auth/login', credentials);
      
      // Store token if provided
      if (response.token || response.accessToken) {
        const token = response.token || response.accessToken;
        localStorage.setItem('authToken', token);
        console.log('✅ Login successful, token stored');
      }
      
      return response;
    } catch (error) {
      console.error('❌ Login failed:', error.message);
      
      // If backend is not reachable, provide a demo mode
      if (error.message.includes('fetch') || error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        console.warn('⚠️ Backend not reachable, enabling demo mode');
        
        // Demo mode - accept any non-empty credentials
        if (credentials.username && credentials.password) {
          const demoUser = {
            id: 1,
            username: credentials.username,
            name: credentials.username,
            email: `${credentials.username}@demo.com`,
            token: 'demo-token-' + Date.now()
          };
          
          localStorage.setItem('authToken', demoUser.token);
          console.log('✅ Demo login successful');
          return demoUser;
        }
      }
      
      throw new Error(`Login failed: ${error.message}`);
    }
  }

  async register(userData) {
    try {
      console.log('🔄 Attempting registration to backend...');
      const response = await this.post('/api/auth/register', userData);
      console.log('✅ Registration successful');
      return response;
    } catch (error) {
      console.error('❌ Registration failed:', error.message);
      
      // If backend is not reachable, provide a demo mode
      if (error.message.includes('fetch') || error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        console.warn('⚠️ Backend not reachable, enabling demo registration mode');
        
        // Demo mode - accept any valid registration data
        if (userData.username && userData.password && userData.name) {
          console.log('✅ Demo registration successful');
          return {
            message: 'Registration successful! (Demo mode - backend not connected)',
            success: true
          };
        }
      }
      
      throw new Error(`Registration failed: ${error.message}`);
    }
  }

  async logout() {
    try {
      // Call logout endpoint if available
      await this.post('/api/auth/logout');
    } catch (error) {
      console.warn('Logout endpoint failed:', error.message);
    } finally {
      // Always remove token from localStorage
      localStorage.removeItem('authToken');
    }
  }

  // User profile endpoints
  async getUserProfile() {
    return this.get('/api/user/profile');
  }

  async updateUserProfile(profileData) {
    return this.put('/api/user/profile', profileData);
  }

  // Posts/Feed endpoints (adjust based on your backend structure)
  async getPosts() {
    try {
      console.log('🔄 Fetching posts from backend...');
      const response = await this.get('/api/posts');
      console.log('✅ Posts fetched successfully');
      return response;
    } catch (error) {
      console.error('❌ Failed to fetch posts:', error.message);
      
      // If backend is not reachable, provide demo posts
      if (error.message.includes('fetch') || error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        console.warn('⚠️ Backend not reachable, returning demo posts');
        
        return [
          {
            id: 1,
            content: "Welcome to the social media app! This is a demo post since the backend is not connected.",
            author: "Demo User",
            createdAt: new Date().toISOString(),
            userId: 1
          },
          {
            id: 2,
            content: "Start your Spring Boot backend at http://localhost:8082 to see real data!",
            author: "System",
            createdAt: new Date(Date.now() - 3600000).toISOString(),
            userId: 2
          }
        ];
      }
      
      throw error;
    }
  }

  async createPost(postData) {
    try {
      console.log('🔄 Creating post...');
      const response = await this.post('/api/posts/create', postData);
      console.log('✅ Post created successfully');
      return response;
    } catch (error) {
      console.error('❌ Failed to create post:', error.message);
      
      // If backend is not reachable, simulate post creation
      if (error.message.includes('fetch') || error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        console.warn('⚠️ Backend not reachable, simulating post creation');
        
        return {
          id: Date.now(),
          content: postData.content,
          author: postData.author || 'Demo User',
          createdAt: new Date().toISOString(),
          userId: postData.userId || 1
        };
      }
      
      throw error;
    }
  }

  async updatePost(postId, postData) {
    return this.put(`/api/posts/${postId}`, postData);
  }

  async deletePost(postId) {
    return this.delete(`/api/posts/${postId}`);
  }

  // Health check endpoint
  async healthCheck() {
    try {
      console.log('🔄 Checking backend health...');
      
      // Try Spring Boot Actuator health endpoint first
      try {
        const response = await this.get('/actuator/health');
        console.log('✅ Backend health check successful (Actuator)');
        return response;
      } catch (actuatorError) {
        // Fallback to a simple ping endpoint
        try {
          const response = await this.get('/api/ping');
          console.log('✅ Backend health check successful (ping)');
          return response;
        } catch (pingError) {
          // Try a simple root endpoint
          const response = await this.get('/');
          console.log('✅ Backend health check successful (root)');
          return response;
        }
      }
    } catch (error) {
      console.error('❌ Backend health check failed:', error.message);
      throw new Error(`Backend not reachable at ${this.baseURL}: ${error.message}`);
    }
  }

  // SCRUM-1 specific endpoints (based on your enhanced UI component)
  async getComponentData() {
    return this.get('/api/ui-component/data');
  }

  async updateComponentSettings(settings) {
    return this.put('/api/ui-component/settings', settings);
  }

  // Generic CRUD operations
  async getAll(resource) {
    return this.get(`/api/${resource}`);
  }

  async getById(resource, id) {
    return this.get(`/api/${resource}/${id}`);
  }

  async create(resource, data) {
    return this.post(`/api/${resource}`, data);
  }

  async update(resource, id, data) {
    return this.put(`/api/${resource}/${id}`, data);
  }

  async deleteById(resource, id) {
    return this.delete(`/api/${resource}/${id}`);
  }

  // File upload endpoint
  async uploadFile(file, endpoint = '/api/upload') {
    const formData = new FormData();
    formData.append('file', file);

    const token = localStorage.getItem('authToken');
    const headers = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'POST',
        headers,
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('File upload failed:', error);
      throw error;
    }
  }
}

// Create and export a singleton instance
const apiService = new ApiService();
export default apiService;

# Backend Integration Guide

## Spring Boot Backend Configuration

Your React frontend is now configured to connect to your Spring Boot backend at `http://localhost:8082`.

### Required Spring Boot Configuration

To allow your React app (running on `http://localhost:3000`) to communicate with your Spring Boot backend, you'll need to configure CORS.

#### 1. Add CORS Configuration Class

Create a `CorsConfig.java` file in your Spring Boot project:

```java
package com.yourpackage.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("http://localhost:3000")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true);
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.addAllowedOrigin("http://localhost:3000");
        configuration.addAllowedMethod("*");
        configuration.addAllowedHeader("*");
        configuration.setAllowCredentials(true);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", configuration);
        return source;
    }
}
```

#### 2. Expected API Endpoints

The frontend expects the following endpoints in your Spring Boot backend:

##### Authentication Endpoints:
- `POST /api/auth/login` - User login
  ```json
  Request: { "username": "string", "password": "string" }
  Response: { "token": "jwt-token", "username": "string", "id": number }
  ```

- `POST /api/auth/register` - User registration
  ```json
  Request: { "username": "string", "password": "string", "name": "string", "email": "string" }
  Response: { "message": "User registered successfully" }
  ```

- `POST /api/auth/logout` - User logout (optional)

##### User Endpoints:
- `GET /api/user/profile` - Get user profile (requires authentication)
  ```json
  Response: { "id": number, "username": "string", "name": "string", "email": "string" }
  ```

- `PUT /api/user/profile` - Update user profile (requires authentication)

##### Posts Endpoints:
- `GET /api/posts` - Get all posts
  ```json
  Response: [
    {
      "id": number,
      "content": "string",
      "author": "string",
      "createdAt": "date",
      "userId": number
    }
  ]
  ```

- `POST /api/posts` - Create new post (requires authentication)
  ```json
  Request: { "content": "string", "userId": number, "author": "string" }
  Response: { "id": number, "content": "string", "author": "string", "createdAt": "date" }
  ```

- `PUT /api/posts/{id}` - Update post (requires authentication)
- `DELETE /api/posts/{id}` - Delete post (requires authentication)

##### Health Check:
- `GET /actuator/health` - Spring Boot Actuator health endpoint
- `GET /api/ping` - Simple ping endpoint (fallback)

#### 3. Security Configuration (if using Spring Security)

```java
package com.yourpackage.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors().and()
            .csrf().disable()
            .sessionManagement().sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            .and()
            .authorizeHttpRequests(authz -> authz
                .requestMatchers("/api/auth/**", "/actuator/health", "/api/ping").permitAll()
                .requestMatchers("/api/**").authenticated()
                .anyRequest().permitAll()
            );
        
        return http.build();
    }
}
```

#### 4. Application Properties

Add to your `application.properties` or `application.yml`:

```properties
# Server configuration
server.port=8082

# CORS configuration
spring.web.cors.allowed-origins=http://localhost:3000
spring.web.cors.allowed-methods=GET,POST,PUT,DELETE,OPTIONS
spring.web.cors.allowed-headers=*
spring.web.cors.allow-credentials=true

# Actuator endpoints
management.endpoints.web.exposure.include=health,info
management.endpoint.health.show-details=always
```

### Frontend API Service

The frontend includes a comprehensive `apiService.js` that handles:

- **Authentication**: Login, register, logout with JWT token management
- **Posts**: CRUD operations for social media posts
- **User Profile**: Get and update user profile information
- **Error Handling**: Comprehensive error handling and logging
- **Health Checks**: Backend connectivity verification

### Testing the Integration

1. Start your Spring Boot backend on `http://localhost:8082`
2. Start your React frontend with `npm start` (usually runs on `http://localhost:3000`)
3. Check the browser console for connection status messages
4. The app header will show a green indicator when connected to the backend

### Troubleshooting

- **CORS Issues**: Ensure CORS is properly configured in your Spring Boot app
- **Port Conflicts**: Make sure your Spring Boot app is running on port 8082
- **Authentication**: Check that JWT tokens are properly implemented if using authentication
- **API Endpoints**: Verify that your backend has the expected endpoints implemented

### Environment Variables (Optional)

You can make the backend URL configurable by creating a `.env` file in your React project root:

```
REACT_APP_API_BASE_URL=http://localhost:8082
```

Then update the apiService.js to use:
```javascript
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8082';
```

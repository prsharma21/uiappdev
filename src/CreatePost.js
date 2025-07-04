import React, { useState } from 'react';
import apiService from './services/apiService';

// Backend Integration: Connected to Spring Boot backend at http://localhost:8082

function CreatePost({ user, onPostCreated }) {
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    if (!content.trim()) {
      setError('Post content cannot be empty');
      setLoading(false);
      return;
    }

    try {
      const postData = {
        content: content.trim(),
        userId: user?.id || user?.username, // Flexible user identification
        author: user?.username || user?.name || 'Anonymous'
      };

      console.log('Creating post with backend at http://localhost:8082...');
      console.log('Post data:', postData);
      
      const response = await apiService.createPost(postData);
      
      console.log('Post created successfully:', response);
      setContent('');
      
      // Notify parent component to refresh posts
      if (onPostCreated) {
        onPostCreated();
      }
      
    } catch (error) {
      console.error('Failed to create post:', error);
      setError(error.message || 'Failed to create post. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h3 style={{ 
        margin: '0 0 15px 0', 
        color: '#2c3e50',
        fontSize: '18px'
      }}>
        Create New Post
      </h3>
      <form onSubmit={handleSubmit}>
        <textarea 
          placeholder="What's on your mind?" 
          value={content} 
          onChange={e => setContent(e.target.value)}
          style={{
            width: '100%',
            minHeight: '100px',
            padding: '12px',
            border: '1px solid #dee2e6',
            borderRadius: '6px',
            fontSize: '14px',
            fontFamily: 'inherit',
            resize: 'vertical',
            marginBottom: '10px',
            outline: 'none'
          }}
          onFocus={e => e.target.style.borderColor = '#007bff'}
          onBlur={e => e.target.style.borderColor = '#dee2e6'}
        />
        <button 
          type="submit"
          disabled={loading}
          style={{
            padding: '10px 20px',
            backgroundColor: loading ? '#6c757d' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontWeight: '500',
            fontSize: '14px',
            transition: 'all 0.2s',
            opacity: loading ? 0.7 : 1
          }}
          onMouseOver={e => {
            if (!loading) e.target.style.backgroundColor = '#0056b3';
          }}
          onMouseOut={e => {
            if (!loading) e.target.style.backgroundColor = '#007bff';
          }}
        >
          {loading ? 'Creating Post...' : 'Post'}
        </button>
      </form>
      {error && (
        <div style={{
          color: '#dc3545',
          marginTop: '10px',
          fontSize: '14px',
          padding: '8px 12px',
          backgroundColor: '#f8d7da',
          border: '1px solid #f5c6cb',
          borderRadius: '4px'
        }}>
          {error}
        </div>
      )}
    </div>
  );
}

export default CreatePost;

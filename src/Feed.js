import React, { useState, useEffect } from 'react';
import CreatePost from './CreatePost';
import apiService from './services/apiService';

// Backend Integration: Connected to Spring Boot backend at http://localhost:8082

// JIRA Issue SCRUM-4: "Create Blue Background in Login and Feed Pages. Add Delete button in each Feed Posts." - IMPLEMENTED
// Added blue background (#007bff) to Feed component and enhanced delete button functionality

function Feed({ user }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreatePost, setShowCreatePost] = useState(false);

  // Function to refresh posts from backend
  const refreshPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching posts from backend at http://localhost:8082...');
      const data = await apiService.getPosts();
      
      console.log('Posts fetched successfully:', data);
      setPosts(Array.isArray(data) ? data : []);
      setShowCreatePost(false); // Hide create post form after successful refresh
    } catch (error) {
      console.error('Failed to fetch posts:', error);
      setError('Failed to load posts. Please try again.');
      setPosts([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  // Load posts on component mount
  useEffect(() => {
    refreshPosts();
  }, []);

  // Handle post deletion
  const handleDeletePost = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post?')) {
      return;
    }

    try {
      await apiService.deletePost(postId);
      console.log('Post deleted successfully');
      
      // Remove post from state
      setPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
    } catch (error) {
      console.error('Failed to delete post:', error);
      alert('Failed to delete post. Please try again.');
    }
  };

  return (
    <div style={{
      backgroundColor: '#007bff', // Blue background as requested in SCRUM-4
      minHeight: '100vh',
      padding: '2rem'
    }}>
      <div style={{ 
        maxWidth: '600px', 
        margin: '0 auto', 
        padding: '20px',
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        marginTop: '20px'
      }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <h2 style={{ margin: '0', color: '#2c3e50' }}>Feed</h2>
        <button
          onClick={() => setShowCreatePost(!showCreatePost)}
          style={{
            padding: '10px 20px',
            backgroundColor: showCreatePost ? '#6c757d' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: '500',
            fontSize: '14px',
            transition: 'all 0.2s'
          }}
        >
          {showCreatePost ? 'Cancel' : '+ Create Post'}
        </button>
      </div>

      {/* Create Post Section */}
      {showCreatePost && (
        <div style={{
          marginBottom: '20px',
          padding: '20px',
          backgroundColor: '#f8f9fa',
          borderRadius: '6px',
          border: '1px solid #dee2e6'
        }}>
          <CreatePost user={user} onPostCreated={refreshPosts} />
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div style={{
          backgroundColor: '#f8d7da',
          color: '#721c24',
          padding: '12px',
          borderRadius: '6px',
          marginBottom: '20px',
          border: '1px solid #f5c6cb',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span>{error}</span>
          <button
            onClick={() => {
              setError(null);
              refreshPosts();
            }}
            style={{
              backgroundColor: 'transparent',
              border: '1px solid #721c24',
              color: '#721c24',
              padding: '4px 8px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            Retry
          </button>
        </div>
      )}

      {/* Posts Feed */}
      {loading ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '40px',
          color: '#666'
        }}>
          <div style={{ marginBottom: '10px' }}>🔄</div>
          Loading posts from backend...
        </div>
      ) : posts.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '40px',
          color: '#666'
        }}>
          <div style={{ marginBottom: '10px' }}>📝</div>
          No posts yet. Be the first to create one!
        </div>
      ) : (
        <div>
          {posts.map(post => (
            <div 
              key={post.id}
              style={{
                padding: '15px',
                marginBottom: '15px',
                backgroundColor: '#f8f9fa',
                borderRadius: '6px',
                border: '1px solid #dee2e6'
              }}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '8px'
              }}>
                <div style={{ 
                  fontWeight: '600', 
                  color: '#007bff'
                }}>
                  {post.author || post.user?.name || post.user?.username || 'Anonymous'}
                </div>
                {/* Delete button - only show if it's the current user's post */}
                {(post.userId === user?.id || post.author === user?.username) && (
                  <button
                    onClick={() => handleDeletePost(post.id)}
                    style={{
                      backgroundColor: 'transparent',
                      border: '1px solid #dc3545',
                      color: '#dc3545',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                    title="Delete post"
                  >
                    🗑️ Delete
                  </button>
                )}
              </div>
              <div style={{ 
                marginBottom: '8px',
                lineHeight: '1.5'
              }}>
                {post.content}
              </div>
              <div style={{ 
                fontSize: '12px', 
                color: '#6c757d'
              }}>
                {post.createdAt ? new Date(post.createdAt).toLocaleString() : 'Just now'}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
    </div>
  );
}

export default Feed;

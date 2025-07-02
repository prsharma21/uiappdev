import React, { useState, useEffect } from 'react';
import CreatePost from './CreatePost';

function Feed({ user }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreatePost, setShowCreatePost] = useState(false);

  // Function to refresh posts after creating a new one
  const refreshPosts = () => {
    setLoading(true);
    fetch('/api/posts')
      .then(res => res.json())
      .then(data => {
        setPosts(data);
        setLoading(false);
        setShowCreatePost(false); // Hide create post form after successful creation
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    refreshPosts();
  }, []);

  return (
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

      {/* Posts Feed */}
      {loading ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '40px',
          color: '#666'
        }}>
          Loading posts...
        </div>
      ) : posts.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '40px',
          color: '#666'
        }}>
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
                fontWeight: '600', 
                color: '#007bff',
                marginBottom: '8px'
              }}>
                {post.user?.name || post.user?.username || 'Anonymous'}
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
  );
}

export default Feed;

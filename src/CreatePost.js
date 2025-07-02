import React, { useState } from 'react';

function CreatePost({ user, onPostCreated }) {
  const [content, setContent] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!content.trim()) {
      setError('Post content cannot be empty');
      return;
    }
    try {
      const res = await fetch('/api/posts/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, content })
      });
      if (res.ok) {
        setContent('');
        if (onPostCreated) onPostCreated();
      } else {
        setError('Failed to create post');
      }
    } catch {
      setError('Server error');
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
          style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: '500',
            fontSize: '14px',
            transition: 'all 0.2s'
          }}
          onMouseOver={e => e.target.style.backgroundColor = '#0056b3'}
          onMouseOut={e => e.target.style.backgroundColor = '#007bff'}
        >
          Post
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

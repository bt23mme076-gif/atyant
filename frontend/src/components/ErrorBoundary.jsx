import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    
    // Auto-reload on chunk load errors (happens when a new version is deployed)
    const chunkErrorKeywords = [
      'Failed to fetch dynamically imported module',
      'Loading chunk',
      'ChunkLoadError'
    ];
    
    const errorMessage = error?.message || '';
    const isChunkError = chunkErrorKeywords.some(keyword => errorMessage.includes(keyword));

    if (isChunkError) {
      console.log('Chunk load error detected. Reloading page...');
      // Small timeout to avoid infinite reload loops if something is really broken
      const lastReload = sessionStorage.getItem('atyant_last_chunk_reload');
      const now = Date.now();
      
      // If we haven't reloaded in the last 10 seconds, reload now
      if (!lastReload || now - parseInt(lastReload) > 10000) {
        sessionStorage.setItem('atyant_last_chunk_reload', now.toString());
        window.location.reload();
      }
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary" style={{
          padding: '40px 20px',
          textAlign: 'center',
          background: 'white',
          borderRadius: '12px',
          margin: '20px auto',
          maxWidth: '600px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ color: '#1f2937', marginBottom: '16px' }}>Something went wrong.</h2>
          <p style={{ color: '#4b5563', marginBottom: '24px' }}>
            We've updated Atyant! Please click the button below to load the latest version.
          </p>
          <button 
            onClick={() => window.location.reload()}
            style={{
              padding: '12px 24px',
              backgroundColor: '#6366f1',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'background 0.2s'
            }}
          >
            Refresh App
          </button>
          
          <div style={{ marginTop: '20px', fontSize: '12px', color: '#9ca3af' }}>
            Technical breakdown: {this.state.error?.message}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
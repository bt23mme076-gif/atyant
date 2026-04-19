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
      console.warn('Chunk load error detected. Forcing site refresh to latest version...');
      const lastReload = sessionStorage.getItem('atyant_err_reload');
      const now = Date.now();
      
      if (!lastReload || now - parseInt(lastReload) > 10000) {
        sessionStorage.setItem('atyant_err_reload', now.toString());
        window.location.reload();
      }
    }
  }

  render() {
    if (this.state.hasError) {
      // If it's a chunk error, show a more specific "Update Found" UI
      const errorMessage = this.state.error?.message || '';
      const isChunkError = errorMessage.includes('Failed to fetch') || errorMessage.includes('Loading chunk');

      return (
        <div className="error-boundary-container" style={{
          minHeight: '60vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          background: '#f9fafb',
          fontFamily: 'Inter, system-ui, sans-serif'
        }}>
          <div style={{
            background: 'white',
            padding: '40px',
            borderRadius: '24px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            maxWidth: '500px',
            width: '100%',
            textAlign: 'center'
          }}>
            <div style={{ 
              fontSize: '48px', 
              marginBottom: '20px',
              animation: 'bounce 2s infinite'
            }}>
              {isChunkError ? '🚀' : '⚠️'}
            </div>
            <h2 style={{ 
              color: '#111827', 
              fontSize: '24px', 
              fontWeight: '800', 
              marginBottom: '12px' 
            }}>
              {isChunkError ? 'New Update Available!' : 'Something went wrong'}
            </h2>
            <p style={{ 
              color: '#4b5563', 
              fontSize: '16px', 
              lineHeight: '1.6', 
              marginBottom: '32px' 
            }}>
              {isChunkError 
                ? "We've just pushed some exciting updates to Atyant. Please refresh to load the latest version."
                : "An unexpected error occurred. Don't worry, a quick refresh usually fixes this."
              }
            </p>
            <button 
              onClick={() => window.location.reload()}
              style={{
                background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                color: 'white',
                border: 'none',
                padding: '16px 32px',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s',
                width: '100%',
                boxShadow: '0 10px 15px -3px rgba(99, 102, 241, 0.4)'
              }}
              onMouseOver={e => e.currentTarget.style.transform = 'scale(1.02)'}
              onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              Refresh Now
            </button>
            
            <details style={{ marginTop: '24px', textAlign: 'left' }}>
              <summary style={{ 
                fontSize: '12px', 
                color: '#9ca3af', 
                cursor: 'pointer', 
                userSelect: 'none' 
              }}>
                Technical error details
              </summary>
              <pre style={{ 
                marginTop: '10px', 
                padding: '12px', 
                background: '#f3f4f6', 
                borderRadius: '8px', 
                fontSize: '11px', 
                color: '#ef4444', 
                overflowX: 'auto',
                whiteSpace: 'pre-wrap'
              }}>
                {errorMessage}
              </pre>
            </details>
          </div>
          <style>{`
            @keyframes bounce {
              0%, 100% { transform: translateY(0); }
              50% { transform: translateY(-10px); }
            }
          `}</style>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
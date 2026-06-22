import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

class GlobalErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '40px', background: '#990000', color: 'white', height: '100vh', width: '100vw', zIndex: 999999, position: 'absolute', top: 0, left: 0 }}>
          <h2>Global App Crash (main.jsx)</h2>
          <pre>{this.state.error && this.state.error.toString()}</pre>
          <pre>{this.state.error && this.state.error.stack}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

const loadScript = (src) => new Promise((resolve, reject) => {
  const script = document.createElement('script');
  script.src = src;
  script.onload = resolve;
  script.onerror = reject;
  document.head.appendChild(script);
});

// Safely patch localStorage to prevent QuotaExceededError crashes
const originalSetItem = localStorage.setItem;
localStorage.setItem = function(key, value) {
  try {
    originalSetItem.apply(this, arguments);
  } catch (e) {
    console.warn(`localStorage quota exceeded or unavailable. Could not save key: ${key}`);
  }
};

// Load massive data scripts dynamically to prevent Vite from hanging during build
Promise.all([
  loadScript('/data-v5.js?v=4.0'),
  loadScript('/blackbook-script.js?v=3.3')
]).then(() => {
  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <GlobalErrorBoundary>
        <App />
      </GlobalErrorBoundary>
    </React.StrictMode>
  )
}).catch(err => {
  console.error("Failed to load massive data scripts", err);
  document.getElementById('root').innerHTML = "<div style='color:white;padding:20px'>Failed to load critical data. Please refresh.</div>";
});


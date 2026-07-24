import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { ThemeProvider } from './contexts/ThemeProvider.jsx'

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

// Safely patch localStorage to prevent QuotaExceededError crashes
const originalSetItem = localStorage.setItem;
localStorage.setItem = function(key, value) {
  try {
    originalSetItem.apply(this, arguments);
  } catch (e) {
    console.warn(`localStorage quota exceeded or unavailable. Could not save key: ${key}`);
  }
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GlobalErrorBoundary>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </GlobalErrorBoundary>
  </React.StrictMode>
)

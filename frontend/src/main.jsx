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

document.getElementById('root').innerHTML = '<div style="position:fixed;top:0;left:0;width:100vw;height:100vh;background:red;z-index:9999;color:white;padding:2rem;"><h1>HELLO JS IS RUNNING</h1></div>';
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GlobalErrorBoundary>
      <App />
    </GlobalErrorBoundary>
  </React.StrictMode>,
)

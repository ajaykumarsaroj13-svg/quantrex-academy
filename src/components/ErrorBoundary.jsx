import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    } else {
      window.location.href = '/';
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex-grow flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
          <div className="bg-red-500/10 border border-red-500/30 p-8 rounded-2xl max-w-md space-y-4">
            <h2 className="text-xl font-bold text-red-500 uppercase tracking-wider">⚠️ System Recovered</h2>
            <p className="text-xs text-gray-400 leading-relaxed">
              Something went wrong while rendering this page. The system has intercepted the error to protect your progress and prevent a crash.
            </p>
            {this.state.error && (
              <pre className="p-3 bg-black/50 border border-white/5 rounded text-[10px] text-red-400/80 font-mono text-left max-h-32 overflow-auto">
                {this.state.error.message || String(this.state.error)}
              </pre>
            )}
            <button
              onClick={this.handleReset}
              className="px-6 py-2.5 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-lg transition-all transform hover:-translate-y-0.5"
            >
              Return to Home
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

import React, { Component } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Production ErrorBoundary caught an exception:', error, errorInfo);
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0B0B0B] text-white flex items-center justify-center p-6 text-center">
          <div className="bg-[#171717] border-2 border-red-500/40 rounded-[22px] max-w-md p-8 space-y-5 shadow-[0_0_60px_rgba(239,68,68,0.25)]">
            <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 mx-auto text-2xl">
              <AlertTriangle size={28} />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-xl font-extrabold uppercase text-white tracking-wide">
                Sabha Session Interrupted
              </h2>
              <p className="text-xs text-[#A1A1AA] leading-relaxed">
                An unexpected client runtime error occurred on the Sabha Floor. Don't worry, your session data is secure.
              </p>
            </div>

            <button
              onClick={this.handleReload}
              className="w-full bg-white text-black hover:bg-neutral-200 font-black py-3 px-4 rounded-[12px] transition text-xs flex items-center justify-center gap-2 border border-[#9A6B32] shadow-xl"
            >
              <RefreshCw size={15} />
              <span>Reload Sabha Floor Session</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

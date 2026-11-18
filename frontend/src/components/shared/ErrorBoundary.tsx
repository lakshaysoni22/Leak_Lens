import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import { ShieldAlert, RotateCcw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackMessage?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Global Error Boundary — catches any unhandled React render error
 * and shows a friendly recovery UI instead of a blank white/black screen.
 */
class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[LeakLens ErrorBoundary]', error, info.componentStack);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/app/dashboard';
  };

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#080B12] flex items-center justify-center p-6">
          <div className="max-w-md w-full text-center space-y-6">
            {/* Icon */}
            <div className="mx-auto w-20 h-20 rounded-full bg-[#FF5A5A]/10 border-2 border-[#FF5A5A]/30 flex items-center justify-center">
              <ShieldAlert className="w-10 h-10 text-[#FF5A5A]" />
            </div>

            {/* Message */}
            <div className="space-y-2">
              <h2 className="text-2xl font-extrabold text-white">
                Something went wrong
              </h2>
              <p className="text-sm text-[#929BAD] leading-relaxed">
                {this.props.fallbackMessage ??
                  'An unexpected error occurred while rendering this page. Your data is safe — try again or navigate back.'}
              </p>
            </div>

            {/* Error detail (dev) */}
            {this.state.error && (
              <div className="bg-[#111827] border border-white/10 rounded-xl p-4 text-left">
                <p className="text-xs font-mono text-[#FF5A5A] break-all">
                  {this.state.error.message}
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={this.handleRetry}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#A3FF6F] text-[#080B12] font-bold text-sm hover:bg-[#8FEE5B] transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                Try Again
              </button>
              <button
                onClick={this.handleGoHome}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 text-white font-bold text-sm hover:bg-white/15 transition-colors border border-white/10"
              >
                <Home className="w-4 h-4" />
                Go to Dashboard
              </button>
            </div>

            {/* Branding */}
            <p className="text-xs text-[#929BAD]/50">
              LeakLens v1.2.8 • Error Boundary Recovery
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

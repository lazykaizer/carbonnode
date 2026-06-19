import { Component, type ReactNode, type ErrorInfo } from 'react';
import Button from './Button';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallbackMessage?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
}

export default class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      errorMessage: '',
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      errorMessage: error.message || 'An unexpected error occurred.',
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    if (import.meta.env.DEV) {
      console.error('ErrorBoundary caught:', error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, errorMessage: '' });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="flex flex-col items-center justify-center p-8 text-center"
          role="alert"
        >
          <span className="text-5xl mb-4" aria-hidden="true">
            ⚠️
          </span>

          <h2 className="text-xl font-bold text-text-primary mb-2">
            Something went wrong
          </h2>

          <p className="text-sm text-text-secondary mb-6 max-w-md">
            {this.props.fallbackMessage || this.state.errorMessage}
          </p>

          <Button onClick={this.handleReset} variant="outline" size="sm">
            Try Again
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

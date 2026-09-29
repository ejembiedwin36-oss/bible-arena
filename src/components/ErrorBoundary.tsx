import { Component, type ErrorInfo, type ReactNode } from 'react';

type Props = { children: ReactNode };
type State = { hasError: boolean };

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Bible Arena UI error:', error, info);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <main className="error-page">
        <section className="card error-card">
          <span className="eyebrow">BIBLE ARENA</span>
          <h1>Something went wrong</h1>
          <p>
            This part of Bible Arena encountered an unexpected problem. Your saved
            account data remains protected. Please reload and try again.
          </p>
          <button onClick={this.handleReload}>Reload Bible Arena</button>
        </section>
      </main>
    );
  }
}

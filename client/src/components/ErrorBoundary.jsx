// GlobalErrorBoundary.jsx
import React from "react";

class GlobalErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }


  
  // componentDidCatch(error, errorInfo) {
  //   console.error("ErrorBoundary caught:", error, errorInfo);
  // }




  componentDidMount() {
    // Catch unhandled promise rejections globally
    window.addEventListener("unhandledrejection", (event) => {
      this.setState({ hasError: true, error: event.reason || new Error("Unknown promise rejection") });
      event.preventDefault(); // stop default console spam
    });

    // Catch uncaught JS errors globally
    window.addEventListener("error", (event) => {
      this.setState({ hasError: true, error: event.error || new Error("Unknown JS error") });
    });
  }

  componentWillUnmount() {
    window.removeEventListener("unhandledrejection", () => {});
    window.removeEventListener("error", () => {});
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 m-4 rounded-lg bg-red-100 text-red-800">
          <h3 className="text-lg font-semibold">Something went wrong</h3>
          <p>{this.state.error?.message || "An unexpected error occurred."}</p>
          <button
            onClick={this.handleReset}
            className="mt-2 px-4 py-2 rounded-lg bg-blue-200"
          >
            Try Again
          </button>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 px-4 py-2 rounded-lg bg-blue-200"
          >
            Refresh
          </button>
         

        </div>
      );
    }
    return this.props.children;
  }
}

export default GlobalErrorBoundary;

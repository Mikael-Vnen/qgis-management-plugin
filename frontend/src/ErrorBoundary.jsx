import { Component } from 'react'

export default class ErrorBoundary extends Component {
  state = { details: null }

  static getDerivedStateFromError(error) {
    return { details: error?.stack || String(error) }
  }

  componentDidCatch(error, info) {
    console.error('Plugin UI failed to render:', error, info.componentStack)
  }

  render() {
    if (this.state.details === null) return this.props.children

    return (
      <section className="react-error-handler" role="alert">
        <h2>The plugin interface couldn’t be displayed.</h2>
        <details open>
          <summary>Technical details</summary>
          <pre>{this.state.details}</pre>
        </details>
        <button type="button" onClick={() => window.location.reload()}>
          Reload plugin interface
        </button>
      </section>
    )
  }
}

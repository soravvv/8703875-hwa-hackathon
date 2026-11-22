import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error) {
    console.error('ScentQuest render error:', error)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-screen">
          <div className="error-screen-card">
            <span className="not-found-code">Oops</span>
            <h1>Something went wrong on this page</h1>
            <p>
              The rest of the shop still works. Reload the page, or head back to the
              home page and try again.
            </p>
            <div className="not-found-actions">
              <button
                className="btn btn-primary"
                onClick={() => window.location.reload()}
              >
                Reload page
              </button>
              <button
                className="btn btn-outline"
                onClick={() => {
                  window.location.hash = ''
                  window.location.reload()
                }}
              >
                Back to home
              </button>
            </div>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

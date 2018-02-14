// @flow
import React, { Component } from 'react'
import './LoadingAnimation.css'

export default class LoadingAnimation extends Component<{ label?: string }> {
  render() {
    return (
      <div className="loaderoverlay">
        <div className="loader-center">
          <div className="loader">Loading...</div>
          {this.props.label && (
            <span className="loader-label">{this.props.label}</span>
          )}
        </div>
      </div>
    )
  }
}

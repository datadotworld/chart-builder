// @flow
import React, { Component } from 'react'
import cx from 'classnames'
import classes from './LoadingAnimation.module.css'
import type { Node } from 'react'

export default class LoadingAnimation extends Component<{
  hideOverlay?: ?boolean,
  label?: Node
}> {
  render() {
    const { hideOverlay, label } = this.props
    return (
      <div
        className={cx(classes.container, hideOverlay && classes.hideOverlay)}
      >
        <div className={classes.center}>
          <div className={classes.loader}>Loading...</div>
          {label && <small>{label}</small>}
        </div>
      </div>
    )
  }
}

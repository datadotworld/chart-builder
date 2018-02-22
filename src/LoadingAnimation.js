// @flow
import React, { Component } from 'react'
import { css, keyframes } from 'emotion'
import styled from 'react-emotion'

const animation = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`
const Overlay = styled('div')`
  background-color: ${props =>
    props.hideOverlay ? 'transparent' : 'rgba(255, 255, 255, 0.875);'};
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 5;
  overflow: hidden;
`

const classes = {
  center: css`
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  `,
  loader: css`
    font-size: 0.5rem;
    text-indent: -9999rem;
    border-top: 0.25rem solid rgba(0, 0, 0, 0.125);
    border-right: 0.25rem solid rgba(0, 0, 0, 0.125);
    border-bottom: 0.25rem solid rgba(0, 0, 0, 0.125);
    border-left: 0.25rem solid #5dc0de;
    transform: translateZ(0);
    animation: ${animation} 0.75s infinite linear;

    &,
    &::after {
      border-radius: 50%;
      z-index: 6;
      overflow: hidden;
      width: 4rem;
      height: 4rem;
      margin-left: 2rem;
    }
  `
}

export default class LoadingAnimation extends Component<{
  hideOverlay?: ?boolean,
  label?: string
}> {
  render() {
    const { hideOverlay, label } = this.props
    return (
      <Overlay hideOverlay={hideOverlay}>
        <div className={classes.center}>
          <div className={classes.loader}>Loading...</div>
          {label && <span>{label}</span>}
        </div>
      </Overlay>
    )
  }
}

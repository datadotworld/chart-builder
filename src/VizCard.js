// @flow
import React, { PureComponent } from 'react'
import { css } from 'emotion'
import type { Node } from 'react'

const classes = {
  container: css`
    height: 700px;
    overflow: auto;
    flex-grow: 1;
    padding: 1rem;
  `
}

export default class VizCard extends PureComponent<{ children: Node }> {
  render() {
    return <div className={classes.container}>{this.props.children}</div>
  }
}

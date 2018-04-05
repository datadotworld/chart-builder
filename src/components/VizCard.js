// @flow
import React, { PureComponent } from 'react'
import type { Node } from 'react'
import classes from './VizCard.module.css'

export default class VizCard extends PureComponent<{ children: Node }> {
  render() {
    return <div className={classes.container}>{this.props.children}</div>
  }
}

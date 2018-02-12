// @flow
import React, { PureComponent } from 'react'
import type { Node } from 'react'
import './VizCard.css'

export default class VizCard extends PureComponent<{ children: Node }> {
  render() {
    return <div className="VizCard">{this.props.children}</div>
  }
}

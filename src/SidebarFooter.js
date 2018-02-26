// @flow
import React, { PureComponent } from 'react'
import { css } from 'emotion'

const classes = {
  bottomBar: css`
    padding: 0.5rem 0.875rem;
    border-top: 1px solid #dfdfdf;
    flex-shrink: 0;
  `,
  name: css`
    display: inline-block;
    float: right;
    line-height: 1.5rem;
    color: #8c9caf;
  `
}

export default class SidebarFooter extends PureComponent<{}> {
  render() {
    return (
      <div className={classes.bottomBar}>
        <a href="https://vega.github.io/vega-lite/docs/">Vega-Lite docs</a>
        <small className={classes.name}>ⓒ data.world</small>
      </div>
    )
  }
}

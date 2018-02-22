// @flow
import React, { Component } from 'react'
import { DraggableCore } from 'react-draggable'
import { css } from 'emotion'
import VegaLiteEmbed from './VegaLiteEmbed'

const classes = {
  container: css`
    transform: translateZ(0px);
    position: relative;
    line-height: 0;
    display: inline-block;
  `,
  handle: css`
    /* styles from https://github.com/STRML/react-resizable/blob/master/css/styles.css */
    position: absolute;
    width: 20px;
    height: 20px;
    bottom: 0;
    right: 0;
    background: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA2IDYiIHN0eWxlPSJiYWNrZ3JvdW5kLWNvbG9yOiNmZmZmZmYwMCIgeD0iMHB4IiB5PSIwcHgiIHdpZHRoPSI2cHgiIGhlaWdodD0iNnB4Ij48ZyBvcGFjaXR5PSIwLjMwMiI+PHBhdGggZD0iTSA2IDYgTCAwIDYgTCAwIDQuMiBMIDQgNC4yIEwgNC4yIDQuMiBMIDQuMiAwIEwgNiAwIEwgNiA2IEwgNiA2IFoiIGZpbGw9IiMwMDAwMDAiLz48L2c+PC9zdmc+');
    background-position: bottom right;
    padding: 0 3px 3px 0;
    background-repeat: no-repeat;
    background-origin: content-box;
    box-sizing: border-box;
    cursor: se-resize;
  `
}

type Props = {
  spec: Object,
  data: Array<Object>,
  showResize: boolean,
  setDimensions: (width: number, height: number) => mixed
}

export default class ResizableVegaLiteEmbed extends Component<Props> {
  handleDrag = (e: any, dragData: Object) => {
    this.props.setDimensions(dragData.x, dragData.y)
  }

  render() {
    return (
      <div className={classes.container}>
        <VegaLiteEmbed {...this.props} key={JSON.stringify(this.props.spec)} />
        {this.props.showResize && (
          <DraggableCore onDrag={this.handleDrag}>
            <span className={classes.handle} />
          </DraggableCore>
        )}
      </div>
    )
  }
}

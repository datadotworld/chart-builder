// @flow
/* eslint no-unused-vars: ["warn", { "args": "after-used" }] */
import React, { Component } from 'react'
import { DraggableCore } from 'react-draggable'
import VegaLiteEmbed from './VegaLiteEmbed'
import classes from './ResizableVegaLiteEmbed.module.css'

type Props = {
  spec: Object,
  data: Array<Object>,
  onViewRender: (v: Object) => void,
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

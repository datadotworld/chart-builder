// @flow
import React, { Component } from 'react'
import { DraggableCore } from 'react-draggable'
import VegaLiteEmbed from './VegaLiteEmbed'
import './ResizableVegaLiteEmbed.css'

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
      <div
        style={{
          transform: 'translateZ(0)',
          position: 'relative',
          lineHeight: 0,
          display: 'inline-block'
        }}
      >
        <VegaLiteEmbed {...this.props} key={JSON.stringify(this.props.spec)} />
        {this.props.showResize && (
          <DraggableCore onDrag={this.handleDrag}>
            <span className="react-resizable-handle" />
          </DraggableCore>
        )}
      </div>
    )
  }
}

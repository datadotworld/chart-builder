import React from 'react'
import ResizableVegaLiteEmbed from '../ResizableVegaLiteEmbed'

jest.mock('react-draggable', () => ({ DraggableCore: 'draggable-core' }))
jest.mock('../VegaLiteEmbed', () => 'vega-lite-embed')

it('renders', () => {
  snap(
    <ResizableVegaLiteEmbed
      spec={{ testspec: 1 }}
      data={[{ data: 1 }]}
      onViewRender={() => {}}
      showResize
      setDimensions={() => {}}
    />
  )
})

it('renders without resize', () => {
  snap(
    <ResizableVegaLiteEmbed
      spec={{ testspec: 1 }}
      data={[{ data: 1 }]}
      onViewRender={() => {}}
      showResize={false}
      setDimensions={() => {}}
    />
  )
})

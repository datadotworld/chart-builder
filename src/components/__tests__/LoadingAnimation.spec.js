import React from 'react'
import LoadingAnimation from '../LoadingAnimation'

it('renders', () => {
  snap(<LoadingAnimation />)
})

it('renders with a label', () => {
  snap(<LoadingAnimation label="foo" />)
})

it('renders without overlay', () => {
  snap(<LoadingAnimation hideOverlay />)
})

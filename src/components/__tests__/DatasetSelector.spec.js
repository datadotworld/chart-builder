import React from 'react'
import DatasetSelector from '../DatasetSelector'

it('renders loading', () => {
  snap(
    <DatasetSelector
      token="foo"
      defaultValue="test/bar"
      value=""
      limitToProjects
      onChange={() => {}}
    />
  )
})

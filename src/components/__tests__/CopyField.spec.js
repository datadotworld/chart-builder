import React from 'react'
import CopyField from '../CopyField'

it('renders', () => {
  snap(<CopyField getValue={() => 'test copy'} />)
})

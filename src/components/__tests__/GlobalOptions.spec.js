import React from 'react'
import Store from '../../util/Store'
import GlobalOptions from '../GlobalOptions'

it('renders', () => {
  const store = Store.create({
    config: {
      width: 100,
      height: 100
    }
  })

  snap(<GlobalOptions store={store} />)
})

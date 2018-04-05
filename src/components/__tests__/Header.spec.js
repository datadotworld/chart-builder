import React from 'react'
import Store from '../../util/Store'
import Header from '../Header'

it('renders', () => {
  const store = Store.create({
    location: {
      search: ''
    }
  })

  snap(<Header store={store} />)
})

it('renders with agentid/datasetid', () => {
  const store = Store.create({
    location: {
      search: 'agentid=foo&datasetid=bar'
    }
  })

  snap(<Header store={store} />)
})

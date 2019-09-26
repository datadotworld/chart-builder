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

it('renders with dataset', () => {
  const store = Store.create({
    location: {
      search: 'dataset=foo/bar'
    }
  })

  snap(<Header store={store} />)
})

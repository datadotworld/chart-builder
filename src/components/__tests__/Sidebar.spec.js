import React from 'react'
import Store, { Field } from '../../util/Store'
import Sidebar from '../Sidebar'

jest.mock('../GlobalOptions', () => 'global-options')

it('renders', () => {
  const store = Store.create({
    fields: [
      Field.create({
        name: 'foo',
        label: 'bar',
        rdfType: 'http://www.w3.org/2001/XMLSchema#float'
      })
    ]
  })

  snap(<Sidebar store={store} />)
})

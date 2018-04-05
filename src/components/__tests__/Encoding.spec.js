import React from 'react'
import { EncLine, Field } from '../../util/Store'
import Encoding from '../Encoding'

it('renders', () => {
  const enc = EncLine.create()
  snap(
    <Encoding
      fields={[
        Field.create({
          name: 'foo',
          label: 'bar',
          rdfType: 'http://www.w3.org/2001/XMLSchema#float'
        })
      ]}
      encodings={[EncLine.create(), enc]}
      encoding={enc}
      disabled={false}
    />
  )
})

import React from 'react'
import { Field } from '../../util/Store'
import FieldSelect from '../FieldSelect'

it('renders', () => {
  snap(
    <FieldSelect
      fields={[
        Field.create({
          name: 'foo',
          label: 'bar',
          rdfType: 'http://www.w3.org/2001/XMLSchema#float'
        })
      ]}
      value={null}
      disabled={false}
      onChange={() => {}}
    />
  )
})

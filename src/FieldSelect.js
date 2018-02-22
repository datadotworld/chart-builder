// @flow
import React, { Component } from 'react'
import styled from 'react-emotion'
import type { FieldType } from './Store'

const Select = styled('select')`
  margin: 0 0.5rem;
  margin-left: 11px;
`

type Props = {
  fields: Array<FieldType>,
  value: ?FieldType,
  disabled: boolean,
  onChange: (f: null | FieldType) => mixed
}

export default class FieldSelect extends Component<Props> {
  render() {
    return (
      <Select
        className="form-control"
        value={this.props.value ? this.props.value.name : ''}
        onChange={e => {
          const found = this.props.fields.find(f => f.name === e.target.value)
          this.props.onChange(found || null)
        }}
        disabled={this.props.disabled}
      >
        <option value="">Choose a column</option>
        {this.props.fields.map(f => {
          return (
            <option key={f.name} value={f.name}>
              {f.label || f.name}
            </option>
          )
        })}
      </Select>
    )
  }
}

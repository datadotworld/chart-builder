// @flow
import React, { Component } from 'react'

type Props<T> = {
  values: Array<T>,
  labels?: Array<string>,
  value: T,
  onChange: (e: T) => any
}

export default class SimpleSelect extends Component<Props<*>> {
  render() {
    const { value, onChange, values, labels } = this.props
    return (
      <select
        value={value}
        onChange={e => {
          onChange(e.target.value)
        }}
      >
        {values.map((e, i) => {
          return (
            <option key={e} value={e}>
              {(labels && labels[i]) || e}
            </option>
          )
        })}
      </select>
    )
  }
}

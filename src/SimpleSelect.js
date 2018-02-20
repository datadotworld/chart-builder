// @flow
import React, { Component } from 'react'

type Props<T> = {
  values: Array<T>,
  labels?: Array<string>,
  value: T,
  style?: Object,
  disabled?: boolean,
  onChange: (e: T) => any
}

export default class SimpleSelect extends Component<Props<*>> {
  render() {
    const { value, onChange, values, labels, style, disabled } = this.props
    return (
      <select
        className="form-control"
        value={value}
        onChange={e => {
          onChange(e.target.value)
        }}
        style={style}
        disabled={disabled}
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

// @flow
import React, { Component } from 'react'

type Props<T> = {
  values: Array<T>,
  value: T,
  onChange: (e: T) => any
}

export default class SimpleSelect extends Component<Props<*>> {
  render() {
    return (
      <select
        value={this.props.value}
        onChange={e => {
          this.props.onChange(e.target.value)
        }}
      >
        {this.props.values.map(e => {
          return (
            <option key={e} value={e}>
              {e}
            </option>
          )
        })}
      </select>
    )
  }
}

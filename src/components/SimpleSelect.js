// @flow
import React, { Component } from 'react'
import Select from 'react-select'
import selectStyles from '../util/selectStyles'

type Props<T> = {
  values: Array<T>,
  labels?: Array<string>,
  value: T,
  placeholder?: string,
  disabled?: boolean,
  isClearable?: boolean,
  onChange: (e: T) => any,
  'data-dw'?: string
}

const NORMAL_SELECT_STYLES = selectStyles({
  control: () => ({
    height: 28,
    fontSize: 13
  })
})

export default class SimpleSelect extends Component<Props<*>> {
  render() {
    const {
      value,
      onChange,
      values,
      labels,
      disabled,
      placeholder,
      isClearable
    } = this.props

    const options = values.map((v, vi) => {
      return { value: v, label: labels ? labels[vi] : v }
    })

    return (
      <div data-dw={this.props['data-dw']}>
        <Select
          classNamePrefix="react-select"
          options={options}
          value={options.find(o => o.value === value)}
          onChange={e => {
            onChange(e ? e.value : null)
          }}
          styles={NORMAL_SELECT_STYLES}
          isDisabled={disabled}
          placeholder={placeholder}
          isClearable={isClearable}
          menuPortalTarget={document.body}
        />
      </div>
    )
  }
}

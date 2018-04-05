// @flow
import React, { Component } from 'react'
import Select from 'react-select'
import selectStyles from '../util/selectStyles'
import type { FieldType } from '../util/Store'

type Props = {
  fields: Array<FieldType>,
  value: ?FieldType,
  disabled: boolean,
  onChange: (f: null | FieldType) => mixed
}

const FIELD_SELECT_STYLES = selectStyles({
  control: () => ({
    margin: '0 0.5rem',
    marginLeft: 11
  }),
  container: () => ({
    flexGrow: 1
  }),
  menu: () => ({
    width: 292
  })
})

export default class FieldSelect extends Component<Props> {
  render() {
    const { fields, value, disabled } = this.props
    const options = fields.map(f => {
      return { value: f.name, label: f.label || f.name, field: f }
    })
    return (
      <Select
        options={options}
        value={options.find(o => value && o.value === value.name)}
        onChange={v => {
          this.props.onChange((v && v.field) || null)
        }}
        isDisabled={disabled}
        styles={FIELD_SELECT_STYLES}
        menuPortalTarget={document.body}
        isClearable
        placeholder="Select a field..."
      />
    )
  }
}

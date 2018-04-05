// @flow
import React, { Component } from 'react'
import SimpleSelect from './SimpleSelect'
import { extendObservable } from 'mobx'
import { observer } from 'mobx-react'
import { getParent } from 'mobx-state-tree'
import {
  Button,
  Form,
  FormGroup,
  Col,
  ControlLabel,
  Radio
} from 'react-bootstrap'
import Select from 'react-select'

import selectStyles from '../util/selectStyles'
import FieldSelect from './FieldSelect'
import classes from './Encoding.module.css'
import type { EncLineType, FieldType, ChartConfigType } from '../util/Store'

const AdvancedFormGroup = props => {
  return <FormGroup className={classes.advancedFormGroup} {...props} />
}

const InlineFormGroup = props => {
  return <FormGroup className={classes.inlineFormGroup} {...props} />
}

const CHANNEL_OPTIONS = [
  {
    label: 'Position',
    options: [
      { value: 'x', label: 'X' },
      { value: 'y', label: 'Y' },
      { value: 'x2', label: 'X2' },
      { value: 'y2', label: 'Y2' }
    ]
  },
  {
    label: 'Mark Properties',
    options: [
      { value: 'color', label: 'Color' },
      { value: 'opacity', label: 'Opacity' },
      { value: 'size', label: 'Size' },
      { value: 'shape', label: 'Shape' }
    ]
  },
  {
    label: 'Text and Tooltip',
    options: [
      { value: 'text', label: 'Text' },
      { value: 'tooltip', label: 'Tooltip' }
    ]
  },
  {
    label: 'Hyperlink',
    options: [{ value: 'href', label: 'Href' }]
  },
  {
    label: 'Order',
    options: [{ value: 'order', label: 'Order' }]
  },
  {
    label: 'Level of Detail',
    options: [{ value: 'detail', label: 'Detail' }]
  },
  {
    label: 'Facet',
    options: [
      { value: 'row', label: 'Row' },
      { value: 'column', label: 'Column' }
    ]
  }
]

const ENCODING_SELECT_STYLES = selectStyles({
  control: () => ({
    width: 86
  }),
  menu: () => ({
    width: 150
  })
})

type EncodingProps = {
  fields: Array<FieldType>,
  encodings: Array<EncLineType>,
  encoding: EncLineType,
  disabled: boolean
}

class Encoding extends Component<EncodingProps> {
  showConfig: boolean

  constructor() {
    super()
    extendObservable(this, {
      showConfig: false
    })
  }

  handleRemove = () => {
    const { encoding } = this.props
    const config: ChartConfigType = getParent(encoding, 2)
    config.removeEncoding(encoding)
  }

  render() {
    const { fields, encoding, encodings, disabled } = this.props

    return (
      <div className={classes.container} data-test="encoding-container">
        <div className={classes.bar} data-test="encoding-bar">
          <Select
            options={CHANNEL_OPTIONS}
            value={CHANNEL_OPTIONS.map(o => o.options)
              .reduce((a, v) => [...a, ...v], [])
              .find(e => e.value === encoding.channel)}
            onChange={e => encoding.setChannel(e.value)}
            isDisabled={disabled}
            styles={ENCODING_SELECT_STYLES}
            menuPortalTarget={document.body}
          />
          <FieldSelect
            fields={fields}
            value={encoding.field}
            onChange={encoding.setField}
            disabled={disabled}
          />
          <Button
            bsSize="xs"
            onClick={() => (this.showConfig = !this.showConfig)}
            style={{ flexShrink: 0 }}
            disabled={disabled}
            data-test="toggle-adv-config"
          >
            Options
          </Button>
        </div>
        {this.showConfig &&
          !disabled && (
            <Form horizontal className={classes.advanced}>
              <AdvancedFormGroup bsSize="xs">
                <Col componentClass={ControlLabel} sm={3}>
                  Type:
                </Col>
                <Col sm={9}>
                  <SimpleSelect
                    values={[
                      'auto',
                      'quantitative',
                      'ordinal',
                      'nominal',
                      'temporal'
                    ]}
                    labels={[
                      `Auto (${encoding.autoType || 'n/a'})`,
                      'Quantitative',
                      'Ordinal',
                      'Nominal',
                      'Temporal'
                    ]}
                    value={encoding.type}
                    onChange={encoding.setType}
                  />
                </Col>
              </AdvancedFormGroup>
              <AdvancedFormGroup bsSize="xs">
                <Col componentClass={ControlLabel} sm={3}>
                  Aggregate:
                </Col>
                <Col sm={9}>
                  <SimpleSelect
                    values={[
                      'argmax',
                      'argmin',
                      'average',
                      'count',
                      'distinct',
                      'max',
                      'mean',
                      'median',
                      'min',
                      'missing',
                      'q1',
                      'q3',
                      'ci0',
                      'ci1',
                      'stdev',
                      'stdevp',
                      'sum',
                      'valid',
                      'values',
                      'variance',
                      'variancep'
                    ]}
                    value={encoding.aggregate}
                    onChange={encoding.setAggregate}
                    isClearable
                    placeholder="Select an aggregation..."
                  />
                </Col>
              </AdvancedFormGroup>
              <AdvancedFormGroup bsSize="xs">
                <Col componentClass={ControlLabel} sm={3}>
                  Bin:
                </Col>
                <Col sm={9}>
                  <InlineFormGroup>
                    <Radio
                      data-test="bin-yes"
                      name="bin-yes"
                      checked={encoding.bin}
                      onChange={() => encoding.setBin(true)}
                      inline
                    >
                      Yes
                    </Radio>{' '}
                    <Radio
                      data-test="bin-no"
                      name="bin-no"
                      checked={!encoding.bin}
                      onChange={() => encoding.setBin(false)}
                      inline
                    >
                      No
                    </Radio>{' '}
                  </InlineFormGroup>
                </Col>
              </AdvancedFormGroup>
              <AdvancedFormGroup bsSize="xs">
                <Col componentClass={ControlLabel} sm={3}>
                  Zero:
                </Col>
                <Col sm={9}>
                  <InlineFormGroup>
                    <Radio
                      data-test="zero-yes"
                      name="zero-yes"
                      checked={encoding.zero}
                      onChange={() => encoding.setZero(true)}
                      inline
                    >
                      Yes
                    </Radio>{' '}
                    <Radio
                      data-test="zero-no"
                      name="zero-no"
                      checked={!encoding.zero}
                      onChange={() => encoding.setZero(false)}
                      inline
                    >
                      No
                    </Radio>{' '}
                  </InlineFormGroup>
                </Col>
              </AdvancedFormGroup>
              <AdvancedFormGroup bsSize="xs">
                <Col componentClass={ControlLabel} sm={3}>
                  Scale:
                </Col>
                <Col sm={9}>
                  <SimpleSelect
                    values={[
                      'linear',
                      'bin-linear',
                      'log',
                      'pow',
                      'sqrt',
                      'time',
                      'utc',
                      'sequential',
                      'ordinal',
                      'bin-ordinal',
                      'point',
                      'band'
                    ]}
                    labels={[
                      'Linear',
                      'Bin-linear',
                      'Log',
                      'Pow',
                      'Sqrt',
                      'Time',
                      'UTC',
                      'Sequential',
                      'Ordinal',
                      'Bin-ordinal',
                      'Point',
                      'Band'
                    ]}
                    value={encoding.scale}
                    onChange={encoding.setScale}
                  />
                </Col>
              </AdvancedFormGroup>
              <AdvancedFormGroup bsSize="xs">
                <Col componentClass={ControlLabel} sm={3}>
                  Sort:
                </Col>
                <Col sm={9}>
                  <InlineFormGroup>
                    <Radio
                      name="advanced-sort"
                      checked={encoding.sort === 'ascending'}
                      onChange={() => encoding.setSort('ascending')}
                      inline
                    >
                      Ascending
                    </Radio>{' '}
                    <Radio
                      name="advanced-sort"
                      checked={encoding.sort === 'descending'}
                      onChange={() => encoding.setSort('descending')}
                      inline
                    >
                      Descending
                    </Radio>{' '}
                    <Radio
                      name="advanced-sort"
                      checked={encoding.sort === 'none'}
                      onChange={() => encoding.setSort('none')}
                      inline
                    >
                      None
                    </Radio>
                  </InlineFormGroup>
                </Col>
              </AdvancedFormGroup>
              {encoding.appliedType === 'nominal' && (
                <AdvancedFormGroup bsSize="xs" style={{ marginTop: 8 }}>
                  <Col sm={9} smOffset={3}>
                    <SimpleSelect
                      values={encodings
                        .filter(e => e !== encoding)
                        .map(s => s._id)}
                      labels={encodings.filter(e => e !== encoding).map(e => {
                        return `${e.channel} - ${
                          e.field ? e.field.label || e.field.name : 'n/a'
                        }`
                      })}
                      value={encoding.sortField ? encoding.sortField._id : null}
                      onChange={id => {
                        encoding.setSortField(
                          encodings.find(e => e._id === id) || null
                        )
                      }}
                      isClearable
                      placeholder="Select a field..."
                    />
                  </Col>
                </AdvancedFormGroup>
              )}
              {encoding.appliedType === 'temporal' && (
                <AdvancedFormGroup bsSize="xs">
                  <Col componentClass={ControlLabel} sm={3}>
                    Time unit:
                  </Col>
                  <Col sm={9}>
                    <SimpleSelect
                      values={[
                        'auto',

                        'year',
                        'quarter',
                        'month',
                        'day',
                        'date',
                        'hours',
                        'minutes',
                        'seconds',
                        'milliseconds',
                        'yearquarter',
                        'yearquartermonth',
                        'yearmonth',
                        'yearmonthdate',
                        'yearmonthdatehours',
                        'yearmonthdatehoursminutes',
                        'yearmonthdatehoursminutesseconds',
                        'quartermonth',
                        'monthdate',
                        'hoursminutes',
                        'hoursminutesseconds',
                        'minutesseconds',
                        'secondsmilliseconds'
                      ]}
                      value={encoding.timeUnit || 'auto'}
                      onChange={t =>
                        encoding.setTimeUnit(t === 'auto' ? null : t)
                      }
                    />
                  </Col>
                </AdvancedFormGroup>
              )}
              <FormGroup bsSize="xs" className={classes.removeGroup}>
                <Col sm={9} smOffset={3}>
                  <InlineFormGroup>
                    <Button
                      data-test="rm-encoding"
                      bsSize="xs"
                      onClick={this.handleRemove}
                    >
                      Remove encoding
                    </Button>
                  </InlineFormGroup>
                </Col>
              </FormGroup>
            </Form>
          )}
      </div>
    )
  }
}

export default observer(Encoding)

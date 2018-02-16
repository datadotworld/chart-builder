// @flow
import React, { Component } from 'react'
import SimpleSelect from './SimpleSelect'
import { extendObservable, action } from 'mobx'
import { observer } from 'mobx-react'
import {
  Button,
  Form,
  FormGroup,
  Col,
  ControlLabel,
  Radio
} from 'react-bootstrap'

import type EncLine from './EncLine'
import type { Field } from './types'

import './Encoding.css'

type FieldSelectProps = {
  fields: Array<Field>,
  value: ?Field,
  onChange: (f: null | Field) => mixed
}

class FieldSelect extends Component<FieldSelectProps> {
  render() {
    return (
      <select
        className="form-control"
        style={{ margin: '0 .5rem', marginLeft: 11 }}
        value={this.props.value ? this.props.value.name : ''}
        onChange={e => {
          const found = this.props.fields.find(f => f.name === e.target.value)
          this.props.onChange(found || null)
        }}
      >
        <option value="">Choose a column</option>
        {this.props.fields.map(f => {
          return (
            <option key={f.name} value={f.name}>
              {f.label || f.name}
            </option>
          )
        })}
      </select>
    )
  }
}

type EncodingProps = {
  fields: Array<Field>,
  encoding: EncLine
}

class Encoding extends Component<EncodingProps> {
  showAdvanced: boolean

  constructor() {
    super()
    extendObservable(this, {
      showAdvanced: false
    })
  }

  handleFieldChange = action('field change', (f: Field) => {
    const { encoding } = this.props
    encoding.field = f
    if (f.name === '*') {
      encoding.aggregate = 'count'
    }
  })

  render() {
    const { fields, encoding } = this.props
    return (
      <div style={{ margin: '1rem 0' }}>
        <div className="Encoding-bar">
          <select
            className="form-control"
            value={encoding.channel}
            onChange={e => (encoding.channel = e.target.value)}
            style={{ width: 80 }}
          >
            <optgroup label="Position">
              <option value="x">x</option>
              <option value="y">y</option>
              <option value="x2">x2</option>
              <option value="y2">y2</option>
            </optgroup>
            <optgroup label="Mark Properties">
              <option value="color">color</option>
              <option value="opacity">opacity</option>
              <option value="size">size</option>
              <option value="shape">shape</option>
            </optgroup>
            <optgroup label="Text and Tooltip">
              <option value="text">text</option>
              <option value="tooltip">tooltip</option>
            </optgroup>
            <optgroup label="Hyperlink">
              <option value="href">href</option>
            </optgroup>
            <optgroup label="Order">
              <option value="order">order</option>
            </optgroup>
            <optgroup label="Level of Detail">
              <option value="detail">detail</option>
            </optgroup>
            <optgroup label="Facet">
              <option value="row">row</option>
              <option value="column">column</option>
            </optgroup>
          </select>
          <FieldSelect
            fields={fields}
            value={encoding.field}
            onChange={this.handleFieldChange}
          />
          <Button
            bsSize="xs"
            onClick={() => (this.showAdvanced = !this.showAdvanced)}
            style={{ width: 120, flexShrink: 0 }}
          >
            {this.showAdvanced ? 'hide advanced' : 'show advanced'}
          </Button>
        </div>
        {this.showAdvanced && (
          <Form horizontal className="Encoding-advanced">
            <FormGroup
              bsSize="xs"
              style={{
                display: 'flex',
                alignItems: 'baseline',
                marginRight: '-0.5rem'
              }}
            >
              <Col componentClass={ControlLabel} sm={3}>
                type:
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
                  labels={[`auto (${encoding.autoType})`]}
                  value={encoding.type}
                  onChange={t => (encoding.type = t)}
                />
              </Col>
            </FormGroup>
            <FormGroup
              bsSize="xs"
              style={{
                display: 'flex',
                alignItems: 'baseline',
                marginRight: '-0.5rem'
              }}
            >
              <Col componentClass={ControlLabel} sm={3}>
                aggregate:
              </Col>
              <Col sm={9}>
                <SimpleSelect
                  values={[
                    'none',
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
                  onChange={t => (encoding.aggregate = t)}
                />
              </Col>
            </FormGroup>
            <FormGroup
              bsSize="xs"
              style={{
                display: 'flex',
                alignItems: 'baseline',
                marginRight: '-0.5rem'
              }}
            >
              <Col componentClass={ControlLabel} sm={3}>
                bin:
              </Col>
              <Col sm={9}>
                <input
                  type="checkbox"
                  checked={encoding.bin}
                  onChange={() => (encoding.bin = !encoding.bin)}
                />
              </Col>
            </FormGroup>
            <FormGroup
              bsSize="xs"
              style={{
                display: 'flex',
                alignItems: 'baseline',
                marginRight: '-0.5rem'
              }}
            >
              <Col componentClass={ControlLabel} sm={3}>
                zero:
              </Col>
              <Col sm={9}>
                <input
                  type="checkbox"
                  checked={encoding.zero}
                  onChange={() => (encoding.zero = !encoding.zero)}
                />
              </Col>
            </FormGroup>
            <FormGroup
              bsSize="xs"
              style={{
                display: 'flex',
                alignItems: 'baseline',
                marginRight: '-0.5rem'
              }}
            >
              <Col componentClass={ControlLabel} sm={3}>
                scale:
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
                  value={encoding.scale}
                  onChange={t => (encoding.scale = t)}
                />
              </Col>
            </FormGroup>
            <FormGroup
              bsSize="xs"
              style={{
                display: 'flex',
                alignItems: 'baseline',
                marginRight: '-0.5rem'
              }}
            >
              <Col componentClass={ControlLabel} sm={3}>
                sort:
              </Col>
              <Col sm={9}>
                <FormGroup style={{ paddingLeft: 16, display: 'inline-block' }}>
                  <Radio
                    name="advanced-sort"
                    checked={encoding.sort === 'ascending'}
                    onChange={() => (encoding.sort = 'ascending')}
                    inline
                  >
                    ascending
                  </Radio>{' '}
                  <Radio
                    name="advanced-sort"
                    checked={encoding.sort === 'descending'}
                    onChange={() => (encoding.sort = 'descending')}
                    inline
                  >
                    descending
                  </Radio>
                </FormGroup>
              </Col>
            </FormGroup>
            {(encoding.type === 'temporal' ||
              encoding.autoType === 'temporal') && (
              <FormGroup
                bsSize="xs"
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  marginRight: '-0.5rem'
                }}
              >
                <Col componentClass={ControlLabel} sm={3}>
                  time unit:
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
                      t === 'auto'
                        ? (encoding.timeUnit = null)
                        : (encoding.timeUnit = t)
                    }
                  />
                </Col>
              </FormGroup>
            )}
          </Form>
        )}
      </div>
    )
  }
}

export default observer(Encoding)

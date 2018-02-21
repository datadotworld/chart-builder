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

import type { EncLineType, FieldType } from './Store'

import './Encoding.css'

type FieldSelectProps = {
  fields: Array<FieldType>,
  value: ?FieldType,
  disabled: boolean,
  onChange: (f: null | FieldType) => mixed
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
      </select>
    )
  }
}

type EncodingProps = {
  fields: Array<FieldType>,
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
    const config = getParent(encoding, 2)
    config.removeEncoding(encoding)
  }

  render() {
    const { fields, encoding, disabled } = this.props
    return (
      <div style={{ margin: '1rem 0' }}>
        <div className="Encoding-bar">
          <select
            className="form-control"
            value={encoding.channel}
            onChange={e => encoding.setChannel(e.target.value)}
            style={{ width: 80 }}
            disabled={disabled}
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
            onChange={encoding.setField}
            disabled={disabled}
          />
          <Button
            bsSize="xs"
            onClick={() => (this.showConfig = !this.showConfig)}
            style={{ width: 102, flexShrink: 0 }}
            disabled={disabled}
          >
            {this.showConfig ? 'Hide config' : 'Show config'}
          </Button>
        </div>
        {this.showConfig &&
          !disabled && (
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
                    labels={[`auto (${encoding.autoType || 'n/a'})`]}
                    value={encoding.type}
                    onChange={encoding.setType}
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
                  Aggregate:
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
                    onChange={encoding.setAggregate}
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
                  Bin:
                </Col>
                <Col sm={9}>
                  <input
                    type="checkbox"
                    checked={encoding.bin}
                    onChange={() => encoding.setBin(!encoding.bin)}
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
                  Zero:
                </Col>
                <Col sm={9}>
                  <input
                    type="checkbox"
                    checked={encoding.zero}
                    onChange={() => encoding.setZero(!encoding.zero)}
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
                    value={encoding.scale}
                    onChange={encoding.setScale}
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
                  Sort:
                </Col>
                <Col sm={9}>
                  <FormGroup
                    style={{ paddingLeft: 16, display: 'inline-block' }}
                  >
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
                </FormGroup>
              )}
              <FormGroup
                bsSize="xs"
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  marginRight: '-0.5rem',
                  marginTop: 8
                }}
              >
                <Col sm={9} smOffset={3}>
                  <FormGroup
                    style={{ paddingLeft: 16, display: 'inline-block' }}
                  >
                    <Button bsSize="xs" onClick={this.handleRemove}>
                      Remove encoding
                    </Button>
                  </FormGroup>
                </Col>
              </FormGroup>
            </Form>
          )}
      </div>
    )
  }
}

export default observer(Encoding)

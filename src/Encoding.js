// @flow
import React, { Component } from 'react'
import SimpleSelect from './SimpleSelect'
import { extendObservable } from 'mobx'
import { observer } from 'mobx-react'
import { Button, Form, FormGroup, Col, ControlLabel } from 'react-bootstrap'

import type EncLine from './EncLine'
import type { EncodingChannel, Field } from './types'

import './Encoding.css'

const ENCODINGS = [
  'x',
  'y',
  'x2',
  'y2',
  'color',
  'opacity',
  'size',
  'shape',
  'text',
  'tooltip',
  'href',
  'order',
  'detail',
  'row',
  'column'
]

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
              {f.name}
            </option>
          )
        })}
      </select>
    )
  }
}

type EncodingSelectProps = {
  encodings: Array<EncodingChannel>,
  value: EncodingChannel,
  onChange: (e: EncodingChannel) => mixed
}

class EncodingSelect extends Component<EncodingSelectProps> {
  render() {
    const { encodings, value, onChange } = this.props
    return (
      <SimpleSelect
        values={encodings}
        value={value}
        onChange={onChange}
        style={{ width: 80 }}
      />
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

  render() {
    const { fields, encoding } = this.props
    return (
      <div style={{ margin: '1rem 0' }}>
        <div className="Encoding-bar">
          <EncodingSelect
            encodings={ENCODINGS}
            value={encoding.channel}
            onChange={e => (encoding.channel = e)}
          />
          <FieldSelect
            fields={fields}
            value={encoding.field}
            onChange={f => (encoding.field = f)}
          />
          <Button
            bsSize="xs"
            onClick={() => (this.showAdvanced = !this.showAdvanced)}
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
                <SimpleSelect
                  values={['ascending', 'descending']}
                  value={encoding.sort}
                  onChange={t => (encoding.sort = t)}
                />
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

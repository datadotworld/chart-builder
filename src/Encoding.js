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
  Radio,
  FormControl
} from 'react-bootstrap'
import { css } from 'emotion'
import styled from 'react-emotion'

import FieldSelect from './FieldSelect'
import type { EncLineType, FieldType } from './Store'

const classes = {
  container: css`
    margin: 1rem 0;
  `,
  bar: css`
    display: flex;
    align-items: center;

    select {
      height: 28px;
    }

    select:nth-child(2) {
      flex-grow: 1;
    }
  `,
  advanced: css`
    .radio-inline {
      padding-top: 0;
    }

    label {
      font-size: 14px;
    }
  `,
  removeGroup: css`
    margin-right: -0.5rem;
    margin-top: 8px;
  `,
  channelSelect: css`
    width: 80px;
  `
}

const AdvancedFormGroup = styled(FormGroup)`
  display: flex;
  align-items: baseline;
  margin-right: -0.5rem;
`

const InlineFormGroup = styled(FormGroup)`
  padding-left: 16px;
  display: inline-block;
`

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
      <div className={classes.container}>
        <div className={classes.bar}>
          <FormControl
            componentClass="select"
            className={classes.channelSelect}
            value={encoding.channel}
            onChange={e => encoding.setChannel(e.target.value)}
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
          </FormControl>
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
                    labels={[`auto (${encoding.autoType || 'n/a'})`]}
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
              </AdvancedFormGroup>
              <AdvancedFormGroup bsSize="xs">
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
              </AdvancedFormGroup>
              <AdvancedFormGroup bsSize="xs">
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
              {(encoding.type === 'temporal' ||
                encoding.autoType === 'temporal') && (
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
                    <Button bsSize="xs" onClick={this.handleRemove}>
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

// @flow
import React, { Component } from 'react'
import SimpleSelect from './SimpleSelect'
import { decorate, observable } from 'mobx'
import { observer } from 'mobx-react'
import { getParent } from 'mobx-state-tree'
import {
  Button,
  Form,
  FormGroup,
  Col,
  ControlLabel,
  HelpBlock,
  Radio,
  OverlayTrigger
} from 'react-bootstrap'
import Select from 'react-select'

import selectStyles from '../util/selectStyles'
import FieldSelect from './FieldSelect'
import classes from './Encoding.module.css'
import type { EncLineType, FieldType, ChartConfigType } from '../util/Store'
import { tooltipOverlay } from '../util/util'

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

const overlayDescriptions = {
  type: 'The encoded field’s type of measurement',
  aggregate: 'Used to compute aggregate summary statistics over groups of data',
  bin: 'Binning discretizes numeric values into a set of bins',
  zero: 'Whether to include zero as the baseline value in the scale or not',
  scale:
    'Scales map data values (numbers, dates, categories, etc.) to visual values (pixels, colors, sizes)',
  sort: 'The sort property determines the order of the scale domain'
}

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
  disabled: boolean,
  'data-test'?: string
}

class Encoding extends Component<EncodingProps> {
  showConfig: boolean = false

  handleRemove = () => {
    const { encoding } = this.props
    const config: ChartConfigType = getParent(encoding, 2)
    config.removeEncoding(encoding)
  }

  render() {
    const { fields, encoding, encodings, disabled } = this.props

    return (
      <div className={classes.container} data-test={this.props['data-test']}>
        <div className={classes.bar} data-test="encoding-bar">
          <Select
            classNamePrefix="react-select"
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
            disabled={disabled}
            data-test="toggle-adv-config"
          >
            Options{' '}
            <svg
              height="16"
              width="16"
              viewBox="0 0 16 16"
              aria-hidden="true"
              focusable="false"
              style={{ transform: this.showConfig ? 'rotate(180deg)' : '' }}
            >
              <g>
                <polyline points="12,5.8 8,10.2 4,5.8" />
              </g>
            </svg>
          </Button>
        </div>
        {this.showConfig &&
          !disabled && (
            <Form horizontal className={classes.advanced}>
              <AdvancedFormGroup bsSize="xs">
                <Col componentClass={ControlLabel} sm={3}>
                  <OverlayTrigger
                    placement="top"
                    overlay={tooltipOverlay(
                      'encoding-type',
                      overlayDescriptions.type
                    )}
                  >
                    {/* This div is needed around each property to shrink the container to text (with no margins/padding).
                      This allows the tooltip to lay right above the text instead of being off-centered. */}
                    <div className={classes.labelText}>Type:</div>
                  </OverlayTrigger>
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
                  <OverlayTrigger
                    placement="top"
                    overlay={tooltipOverlay(
                      'encoding-aggregate',
                      overlayDescriptions.aggregate
                    )}
                  >
                    <div className={classes.labelText}>Aggregate:</div>
                  </OverlayTrigger>
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
                  <OverlayTrigger
                    placement="top"
                    overlay={tooltipOverlay(
                      'encoding-bin',
                      overlayDescriptions.bin
                    )}
                  >
                    <div className={classes.labelText}>Bin:</div>
                  </OverlayTrigger>
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
                  <OverlayTrigger
                    placement="top"
                    overlay={tooltipOverlay(
                      'encoding-zero',
                      overlayDescriptions.zero
                    )}
                  >
                    <div className={classes.labelText}>Zero:</div>
                  </OverlayTrigger>
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
                  <OverlayTrigger
                    placement="top"
                    overlay={tooltipOverlay(
                      'encoding-scale',
                      overlayDescriptions.scale
                    )}
                  >
                    <div className={classes.labelText}>Scale:</div>
                  </OverlayTrigger>
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
                  <OverlayTrigger
                    placement="top"
                    overlay={tooltipOverlay(
                      'encoding-sort',
                      overlayDescriptions.sort
                    )}
                  >
                    <div className={classes.labelText}>Sort:</div>
                  </OverlayTrigger>
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
                          /* flowlint-next-line sketchy-null:off */
                          e.field ? e.field.label || e.field.name : 'n/a'
                        }`
                      })}
                      value={encoding.sortField ? encoding.sortField._id : null}
                      onChange={id => {
                        const e = encodings.find(e => e._id === id) || null
                        encoding.setSortField(e)
                      }}
                      isClearable
                      placeholder="Select a field..."
                    />
                    {encoding.sortField &&
                      !encoding.sortField.aggregate && (
                        <HelpBlock>
                          Selected sort field does not have an aggregation
                          function set, defaulting to "sum" for sorting.
                        </HelpBlock>
                      )}
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

decorate(Encoding, {
  showConfig: observable
})

export default observer(Encoding)

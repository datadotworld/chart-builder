// @flow
import React, { Component } from 'react'
import SimpleSelect from './SimpleSelect'
import { extendObservable, runInAction } from 'mobx'
import { observer } from 'mobx-react'
import { Button } from 'react-bootstrap'
import sparqlTypeToVegaType from './sparqlTypeToVegaType'
import type EncLine from './EncLine'
import type { EncodingChannel, Field } from './types'

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
  onChange: (f: Field) => mixed
}

class FieldSelect extends Component<FieldSelectProps> {
  render() {
    return (
      <select
        value={this.props.value ? this.props.value.name : ''}
        onChange={e => {
          const found = this.props.fields.find(f => f.name === e.target.value)
          if (found) {
            this.props.onChange(found)
          }
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
    return <SimpleSelect values={encodings} value={value} onChange={onChange} />
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
        {this.showAdvanced && (
          <div
            style={{
              width: 300
            }}
          >
            <div>
              <label>
                type:
                <SimpleSelect
                  values={[
                    'auto',
                    'quantitative',
                    'ordinal',
                    'nominal',
                    'temporal'
                  ]}
                  labels={[
                    `auto (${encoding.autoType})`,
                  ]}
                  value={encoding.type}
                  onChange={t => (encoding.type = t)}
                />
              </label>
            </div>
            <div>
              <label>
                bin:
                <input
                  type="checkbox"
                  checked={encoding.bin}
                  onChange={() => (encoding.bin = !encoding.bin)}
                />
              </label>
            </div>
            <div>
              <label>
                aggregate:
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
              </label>
            </div>
            <div>
              <label>
                zero:
                <input
                  type="checkbox"
                  checked={encoding.zero}
                  onChange={() => (encoding.zero = !encoding.zero)}
                />
              </label>
            </div>
            <div>
              <label>
                scale:
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
              </label>
            </div>
          </div>
        )}
      </div>
    )
  }
}

export default observer(Encoding)

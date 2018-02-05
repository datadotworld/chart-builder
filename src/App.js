import React, { Component } from 'react'
import { toJS, extendObservable, runInAction, observable } from 'mobx'
import { observer } from 'mobx-react'
import * as vegaImport from 'vega'
import * as VegaLite from 'vega-lite'
import * as VegaTooltip from 'vega-tooltip'
import * as cql from 'compassql'
import DevTools from 'mobx-react-devtools'
import './App.css'
import 'vega-tooltip/build/vega-tooltip.css'

export const vega = vegaImport
export const vl = VegaLite

const token =
  'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJkZXYtY2xpZW50OnVzZXI5IiwiaXNzIjoiYWdlbnQ6dXNlcjk6OjExMWY3ODNlLWExMzMtNDE5YS1hYTI5LWRlNWE1MTE1ZmQwZSIsImlhdCI6MTUwMjI5MTg4NCwicm9sZSI6WyJ1c2VyX2FwaV9yZWFkIiwidXNlcl9hcGlfd3JpdGUiXSwiZ2VuZXJhbC1wdXJwb3NlIjp0cnVlfQ.iUQXx_a_uahylfK6W5K1P8a2xeyWn9To7xTA0ML5twNIDn65L7u3PSqvDVerCqnon3AkJIf361j_9EHEB6pyAw'

type Field = {
  name: string,
  type: string,
  rdfType: string
}

type Schema = {
  fields: Array<Field>
}

type EncodingType =
  | 'x'
  | 'y'
  | 'x2'
  | 'y2'
  | 'color'
  | 'opacity'
  | 'size'
  | 'shape'
  | 'text'
  | 'tooltip'
  | 'href'
  | 'order'
  | 'detail'
  | 'row'
  | 'column'

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

const MarkType =
  'area' |
  'bar' |
  'line' |
  'point' |
  'text' |
  'tick' |
  'rect' |
  'rule' |
  'circle' |
  'square' |
  'geoshape'

const MARKS = [
  'area',
  'bar',
  'line',
  'point',
  'text',
  'tick',
  'rect',
  'rule',
  'circle',
  'square',
  'geoshape'
]

const createBlankEncLine = () => ({
  field: null,
  channel: 'x',
  type: 'auto',

  bin: false,
  aggregate: 'none',
  zero: true,
  scale: 'linear'
})

class VegaLiteEmbed extends Component {
  shouldComponentUpdate() {
    return false
  }

  componentDidMount() {
    let { spec, width, height } = this.props
    const loader = vega.loader()
    const logLevel = vega.Warn
    const renderer = 'svg'

    spec = vl.compile(spec).spec

    console.log(spec)

    const runtime = vega.parse(spec)

    const view = new vega.View(runtime, {
      loader,
      logLevel,
      renderer
    }).initialize(this.node)

    VegaTooltip.vegaLite(view, spec)

    view.width(width)
    view.height(height)

    view.run()
  }

  render() {
    return <div ref={r => (this.node = r)} />
  }
}

class FieldSelect extends Component {
  props: {
    fields: Array<Field>,
    value: ?Field,
    onChange: (f: Field) => mixed
  }
  render() {
    return (
      <select
        value={this.props.value ? this.props.value.name : ''}
        onChange={e => {
          this.props.onChange(
            this.props.fields.find(f => f.name === e.target.value)
          )
        }}
      >
        <option value="">None</option>
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

class SimpleSelect extends Component {
  props: {
    values: Array<string>,
    value: string,
    onChange: (e: string) => mixed
  }

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

class EncodingSelect extends Component {
  props: {
    value: EncodingType,
    onChange: (e: EncodingType) => mixed
  }
  render() {
    return (
      <SimpleSelect
        values={ENCODINGS}
        value={this.props.value}
        onChange={this.props.onChange}
      />
    )
  }
}

class Encoding_ extends Component {
  props: {
    fields: Array<Field>,
    encoding: EncLineType
  }

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
        Encode
        <FieldSelect
          fields={fields}
          value={encoding.field}
          onChange={f => (encoding.field = f)}
        />
        as
        <EncodingSelect
          value={encoding.channel}
          onChange={e => (encoding.channel = e)}
        />
        {this.showAdvanced ? (
          <span
            style={{
              display: 'inline-block',
              width: 300,
              verticalAlign: 'top',
              marginLeft: '1rem'
            }}
          >
            <div>
              type:
              <SimpleSelect
                values={[
                  'auto',
                  'quantitative',
                  'ordinal',
                  'nominal',
                  'temporal'
                ]}
                value={encoding.type}
                onChange={t => (encoding.type = t)}
              />
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
            </div>
          </span>
        ) : (
          <button onClick={() => (this.showAdvanced = true)}>
            show advanced
          </button>
        )}
      </div>
    )
  }
}

const Encoding = observer(Encoding_)

type EncLineType = {
  field: ?Field,
  encoding: EncodingType
}

type ConfigType = {
  mark: MarkType,
  encodings: Array<EncLineType>
}

class App extends Component {
  config: ConfigType
  schema: ?Schema

  constructor() {
    super()
    extendObservable(this, {
      queryUrl: 'http://localhost:9104/v0/sql/user9/trivial-linked',
      query: `SELECT *
FROM raw_county_election_data
limit 100`,
      schema: null,
      // data: null,
      config: {
        encodings: [],
        mark: 'bar'
      },

      s: null
    })

    this.fetchQuery()
  }

  fetchQuery = async () => {
    runInAction(() => {
      this.schema = null
      this.data = null
    })
    const data = await fetch(this.queryUrl + '?includeTableSchema=true', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({ query: this.query }).toString()
    }).then(r => r.json())
    const [dschema, ...rows] = data
    runInAction(() => {
      this.schema = dschema
      this.data = rows
      this.config = {
        encodings: [
          { ...createBlankEncLine(), encoding: 'x' },
          { ...createBlankEncLine(), encoding: 'y' },
          { ...createBlankEncLine(), encoding: 'color' }
        ],
        mark: 'bar'
      }
    })
  }

  buildSchema(includeValues = true) {
    const { config } = this
    const encoding = {}
    config.encodings.forEach(e => {
      if (e.field) {
        const enc = {
          field: e.field.name,
          type: e.type === 'auto' ? undefined : e.type,
          bin: e.bin || undefined,
          aggregate: e.aggregate === 'none' ? undefined : e.aggregate,
          scale: {
            type: e.scale,
            zero: e.zero
          }
          // type: 'quantitative'
        }
        encoding[e.channel] = enc
      }
    })

    return {
      $schema: 'https://vega.github.io/schema/vega-lite/v2.json',
      mark: config.mark,
      encoding,
      data: {
        values: includeValues ? toJS(this.data) : ['...']
      }
    }
  }

  search = () => {
    const rows = toJS(this.data)
    const query = {
      spec: cql.query.spec.fromSpec(this.buildSchema()),
      groupBy: 'fieldTransform',
      orderBy: ['fieldOrder', 'aggregationQuality', 'effectiveness'],
      chooseBy: ['aggregationQuality', 'effectiveness'],
      config: { omitTableWithOcclusion: false, autoAddCount: false }
    }
    query.spec.mark = '?'
    // query.spec.encodings = query.spec.encoding
    delete query.spec.encoding
    var schema = cql.schema.build(rows)
    var output = cql.recommend(query, schema, {})
    // var result = output.result // recommendation result

    const specs = []
    const result = cql.result.mapLeaves(output.result, item => {
      const s = item.toSpec()
      specs.push(s)
      return s
    })
    // var vlTree = cql.result.mapLeaves(result, function(item) {
    //   return item.toSpec()
    // })
    // var topVlSpec = vlTree.items[0]
    console.log(result)
    console.log(specs)
  }

  render() {
    return (
      <div className="App">
        <DevTools />
        <input
          type="text"
          value={this.queryUrl}
          onChange={e => {
            this.queryUrl = e.target.value
          }}
          style={{ width: 400 }}
        />
        <textarea
          value={this.query}
          onChange={e => {
            this.query = e.target.value
          }}
          rows="5"
          cols="30"
        />
        <button onClick={this.fetchQuery}>fetch</button>
        <button onClick={this.search}>search</button>
        {this.schema && (
          <React.Fragment>
            {this.config.encodings.map((e, ei) => {
              return (
                <Encoding key={ei} fields={this.schema.fields} encoding={e} />
              )
            })}
            <div>
              <button
                onClick={() => this.config.encodings.push(createBlankEncLine())}
              >
                add encoding
              </button>
            </div>
            <div>
              Mark:
              <SimpleSelect
                values={MARKS}
                value={this.config.mark}
                onChange={e => (this.config.mark = e)}
              />
            </div>
          </React.Fragment>
        )}
        {this.data &&
          this.schema && (
            <div>
              {this.config.encodings.some(e => e.field) && (
                <VegaLiteEmbed
                  spec={this.buildSchema()}
                  key={JSON.stringify(this.buildSchema())}
                  width={600}
                  height={600}
                />
              )}
              <pre>{JSON.stringify(this.buildSchema(false), null, 2)}</pre>
            </div>
          )}

        {this.schema && <pre>{JSON.stringify(this.schema, null, 2)}</pre>}
        {this.data && <pre>Length: {this.data.length}</pre>}
      </div>
    )
  }
}

export default observer(App)

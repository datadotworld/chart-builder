// @flow
import React, { Fragment, Component } from 'react'
import { toJS, extendObservable, runInAction } from 'mobx'
import { observer } from 'mobx-react'
import { Link } from 'react-router-dom'
import DevTools from 'mobx-react-devtools'
import { Grid, Row, Button, Col, Tabs, Tab } from 'react-bootstrap'
import './App.css'
import 'vega-tooltip/build/vega-tooltip.css'
import { API_HOST } from './constants'
import Header from './Header'
import VizCard from './VizCard'
import Editor from './Editor'
import VegaLiteEmbed from './VegaLiteEmbed'
import SimpleSelect from './SimpleSelect'
import Encoding from './Encoding'
import EncLine from './EncLine'
import type { ConfigType, Schema } from './types'

const MARKS = [
  'area',
  'bar',
  'line',
  'point',
  'tick',
  'rect',
  'circle',
  'square'
]

class App extends Component<{
  history: Object,
  location: Object
}> {
  config: ConfigType
  schema: ?Schema
  data: ?Object

  agentid: string
  datasetid: string
  query: string
  isValidPage: boolean
  token: string
  parsedUrlQuery: Object

  loading: boolean
  saving: boolean
  saved: boolean

  constructor(props) {
    super(props)
    extendObservable(this, {
      schema: null,
      // data: null,
      loading: true,
      saving: false,
      saved: false,
      config: {
        encodings: [],
        manualSpec: null,
        mark: 'bar'
      },

      get parsedUrlQuery() {
        const query = new URLSearchParams(this.props.location.search)
        const obj = {}
        for (let entry of query) {
          obj[entry[0]] = entry[1]
        }
        return obj
      },

      get agentid() {
        return this.parsedUrlQuery.agentid
      },
      get datasetid() {
        return this.parsedUrlQuery.datasetid
      },
      get query() {
        return this.parsedUrlQuery.query
      },

      get isValidPage() {
        return !!this.agentid && !!this.datasetid && !!this.query
      },

      token: window.localStorage.getItem('token')

      // s: null
    })

    if (this.isValidPage && this.token) {
      this.fetchQuery()
    }
  }

  getQueryUrl() {
    return `${API_HOST}/v0/sql/${this.agentid}/${
      this.datasetid
    }?includeTableSchema=true`
  }

  getUploadUrl() {
    return `${API_HOST}/v0/uploads/${this.agentid}/${
      this.datasetid
    }/files/vega-lite.vl.json`
  }

  fetchQuery = async () => {
    runInAction(() => {
      this.schema = null
      this.data = null
      this.loading = true
    })
    const data = await fetch(this.getQueryUrl(), {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${this.token}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({ query: this.query }).toString()
    }).then(r => r.json())
    const [dschema, ...rows] = data
    runInAction(() => {
      this.schema = {
        fields: [
          ...dschema.fields,
          {
            name: '*',
            rdfType: 'http://www.w3.org/2001/XMLSchema#string',
            type: 'string'
          }
        ]
      }
      this.data = rows
      this.loading = false
      this.config = {
        encodings: [
          new EncLine({ channel: 'x' }),
          new EncLine({ channel: 'y' }),
          new EncLine({ channel: 'color' })
        ],
        mark: 'bar',
        manualSpec: null
      }
    })
  }

  uploadFile = async () => {
    this.saving = true
    await fetch(this.getUploadUrl(), {
      method: 'PUT',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${this.token}`,
        'Content-Type': 'application/octet-stream'
      },
      body: JSON.stringify(this.buildSchema())
    }).then(r => r.json())
    runInAction(() => {
      this.saving = false
      this.saved = true

      setTimeout(() => (this.saved = false), 1000)
    })
  }

  buildSchema(includeValues = true) {
    const { config } = this
    if (config.manualSpec) {
      try {
        const obj = JSON.parse(config.manualSpec)
        obj.data = includeValues
          ? {
              values: toJS(this.data)
            }
          : { name: 'source' }
        return obj
      } catch (e) {}
    }

    const encoding = {}
    config.encodings.forEach(e => {
      if (e.field) {
        const enc = {
          field: e.field.name,
          type: e.type === 'auto' ? e.autoType : e.type,
          bin: e.bin || undefined,
          aggregate: e.aggregate === 'none' ? undefined : e.aggregate,
          sort: e.sort === 'ascending' ? undefined : e.sort,
          timeUnit: e.timeUnit || undefined,
          scale: {
            type: e.scale,
            zero: e.zero
          }
        }
        encoding[e.channel] = enc
      }
    })

    return {
      $schema: 'https://vega.github.io/schema/vega-lite/v2.json',
      mark: config.mark,
      encoding,
      data: includeValues
        ? {
            values: toJS(this.data)
          }
        : { name: 'source' }
    }
  }

  get hasPossiblyValidChart() {
    return this.config.encodings.some(e => e.field)
  }

  render() {
    if (!this.isValidPage) {
      return (
        <Fragment>
          {process.env.NODE_ENV === 'development' && <DevTools />}
          <Header />
          <Grid style={{ marginTop: 32 }}>
            <Row>
              <Col xs={12}>
                <h3>Valid params required</h3>
                <Link
                  to={{
                    pathname: '/',
                    search:
                      '?agentid=data-society&datasetid=iris-species&query=SELECT+%2A%0AFROM+iris'
                  }}
                >
                  Here are some
                </Link>
              </Col>
            </Row>
          </Grid>
        </Fragment>
      )
    }

    if (this.loading) {
      return (
        <Fragment>
          {process.env.NODE_ENV === 'development' && <DevTools />}
          <Header />
          <Grid style={{ marginTop: 32 }}>
            <Row>
              <Col xs={12}>
                <h3>
                  {this.agentid}/{this.datasetid}
                </h3>
              </Col>
            </Row>
            <Row>
              <Col xs={6}>
                <h4>Loading...</h4>
              </Col>
            </Row>
          </Grid>
        </Fragment>
      )
    }

    const { schema } = this

    return (
      <Fragment>
        {process.env.NODE_ENV === 'development' && <DevTools />}
        <Header agentid={this.agentid} datasetid={this.datasetid} />
        <Grid style={{ marginTop: 32 }}>
          <Row>
            <Col xs={8}>
              <h3>
                {this.agentid}/{this.datasetid}
              </h3>
            </Col>
            <Col xs={4}>
              <div className="pull-right">
                {this.saved && (
                  <small>
                    saved to {this.agentid}/{this.datasetid}/vega-lite.vl.json
                  </small>
                )}
                <Button
                  bsSize="xs"
                  onClick={this.uploadFile}
                  disabled={!this.hasPossiblyValidChart || this.saving}
                >
                  {this.saving ? 'saving to dataset' : 'save to dataset'}
                </Button>
              </div>
            </Col>
          </Row>
          <Row>
            <Col xs={4}>
              <Tabs
                defaultActiveKey={1}
                id="configure-tabs"
                animation={false}
                className="App-editTab"
                unmountOnExit
              >
                <Tab eventKey={1} title="Configure">
                  <h4>Build your chart</h4>
                  <div className="App-title">Marks</div>
                  <SimpleSelect
                    values={MARKS}
                    value={this.config.mark}
                    onChange={e => (this.config.mark = e)}
                  />
                  <div className="App-title">Configure Chart</div>
                  {schema && (
                    <Fragment>
                      {this.config.encodings.map((e, ei) => {
                        return (
                          <Encoding
                            key={ei}
                            fields={schema.fields}
                            encoding={e}
                          />
                        )
                      })}
                      <div>
                        <Button
                          bsSize="xs"
                          onClick={() =>
                            this.config.encodings.push(new EncLine())
                          }
                        >
                          add encoding
                        </Button>
                      </div>
                    </Fragment>
                  )}
                </Tab>
                <Tab
                  eventKey={2}
                  title="Spec"
                  disabled={!this.hasPossiblyValidChart}
                >
                  {this.hasPossiblyValidChart && (
                    <Editor
                      onChange={e => {
                        this.config.manualSpec = e
                      }}
                      value={JSON.stringify(this.buildSchema(false), null, 2)}
                    />
                  )}
                </Tab>
              </Tabs>
            </Col>
            <Col xs={8}>
              <VizCard>
                {(this.data &&
                  schema &&
                  this.hasPossiblyValidChart && (
                    <div style={{ transform: 'translateZ(0)' }}>
                      {
                        <VegaLiteEmbed
                          spec={this.buildSchema()}
                          key={JSON.stringify(this.buildSchema(false))}
                          width={681}
                          height={510}
                        />
                      }
                    </div>
                  )) || (
                  <div className="App-vizPlaceholder">
                    <div className="App-vizPlaceholderText">
                      Choose a chart type and columns <br />to the left and your
                      chart will appear.<br />Like magic ✨
                    </div>
                  </div>
                )}
              </VizCard>
            </Col>
          </Row>
        </Grid>
      </Fragment>
    )
  }
}

export default observer(App)

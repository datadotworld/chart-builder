// @flow
import React, { Fragment, Component } from 'react'
import { extendObservable, runInAction } from 'mobx'
import { observer } from 'mobx-react'
import { Link } from 'react-router-dom'
import DevTools from 'mobx-react-devtools'
import {
  Grid,
  Row,
  Button,
  Col,
  Tabs,
  Tab,
  ButtonToolbar
} from 'react-bootstrap'
import SaveAsFileModal from './SaveAsFileModal'
import SaveAsInsightModal from './SaveAsInsightModal'
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
import VizEmpty from './VizEmpty'
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
  data: ?Array<Object>

  agentid: string
  datasetid: string
  query: string
  isValidPage: boolean
  token: string
  parsedUrlQuery: Object

  loading: boolean

  saveModalOpen: false | 'insight' | 'file'

  constructor(props) {
    super(props)
    extendObservable(this, {
      schema: null,
      // data: null,
      loading: true,
      config: {
        encodings: [],
        manualSpec: null,
        mark: 'bar'
      },
      saveModalOpen: false,

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
            label: 'COUNT(*)',
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

  buildSchema() {
    const { config } = this
    if (config.manualSpec) {
      try {
        const obj = JSON.parse(config.manualSpec)
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
      data: { name: 'source' },
      config: { background: '#ffffff', padding: 20 }
    }
  }

  get hasPossiblyValidChart() {
    return this.config.encodings.some(e => e.field)
  }

  renderEmbed() {
    const { data, schema } = this
    return (
      (data &&
        schema &&
        this.hasPossiblyValidChart && (
          <div style={{ transform: 'translateZ(0)' }}>
            {
              <VegaLiteEmbed
                spec={this.buildSchema()}
                data={data}
                key={JSON.stringify(this.buildSchema())}
                width={681}
                height={510}
              />
            }
          </div>
        )) || <VizEmpty />
    )
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
        <Grid fluid className="App-topBar">
          <Row>
            <Col xs={12} className="App-topBarCol">
              <div className="App-topBarHeader">
                {this.agentid}/{this.datasetid}
              </div>
              <div className="App-topBarButtons">
                <ButtonToolbar>
                  <Button
                    bsSize="xs"
                    onClick={() => (this.saveModalOpen = 'file')}
                    disabled={!this.hasPossiblyValidChart}
                  >
                    Save as file
                  </Button>
                  <Button
                    bsSize="xs"
                    onClick={() => (this.saveModalOpen = 'insight')}
                    disabled={!this.hasPossiblyValidChart}
                  >
                    Save as insight
                  </Button>
                </ButtonToolbar>
              </div>
            </Col>
          </Row>
        </Grid>
        <div
          style={{
            flexGrow: 1,
            display: 'flex'
          }}
        >
          <div
            style={{
              overflowY: 'auto',
              width: 400,
              backgroundColor: '#fff',
              boxShadow: '2px 0 4px 0 rgba(0,0,0,.1)',
              flexShrink: 0,
              zIndex: 4
            }}
          >
            <Tabs
              defaultActiveKey={1}
              id="configure-tabs"
              animation={false}
              className="App-editTab"
              unmountOnExit
            >
              <Tab
                eventKey={1}
                title="Visual Builder"
                className="App-builderTab"
              >
                <div className="App-title">Marks</div>
                <SimpleSelect
                  values={MARKS}
                  value={this.config.mark}
                  onChange={e => (this.config.mark = e)}
                />
                <div className="App-title">
                  Configure Chart
                  <Button
                    bsStyle="link"
                    bsSize="xs"
                    className="pull-right"
                    style={{ paddingLeft: 0, paddingRight: 0 }}
                    onClick={() => this.config.encodings.push(new EncLine())}
                  >
                    Add encoding
                  </Button>
                </div>
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
                    <div />
                  </Fragment>
                )}
              </Tab>
              <Tab
                eventKey={2}
                title="Vega-Lite Editor"
                disabled={!this.hasPossiblyValidChart}
              >
                {this.hasPossiblyValidChart && (
                  <Editor
                    onChange={e => {
                      this.config.manualSpec = e
                    }}
                    value={JSON.stringify(this.buildSchema(), null, 2)}
                  />
                )}
              </Tab>
            </Tabs>
          </div>
          <div
            style={{
              display: 'flex',
              flexGrow: 1,
              flexDirection: 'column',
              minWidth: 0
            }}
          >
            <VizCard>{this.renderEmbed()}</VizCard>
          </div>
        </div>
        {this.saveModalOpen === 'insight' && (
          <SaveAsInsightModal
            onClose={() => (this.saveModalOpen = false)}
            spec={this.buildSchema()}
            defaultId={this.agentid + '/' + this.datasetid}
            data={this.data}
            token={this.token}
          />
        )}
        {this.saveModalOpen === 'file' && (
          <SaveAsFileModal
            onClose={() => (this.saveModalOpen = false)}
            spec={this.buildSchema()}
            defaultId={this.agentid + '/' + this.datasetid}
            data={this.data}
            token={this.token}
          />
        )}
      </Fragment>
    )
  }
}

export default observer(App)

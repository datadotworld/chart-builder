// @flow
import React, { Fragment, Component } from 'react'
import { extendObservable, runInAction } from 'mobx'
import { observer, inject } from 'mobx-react'
import { Link } from 'react-router-dom'
import DevTools from 'mobx-react-devtools'
import {
  Grid,
  Row,
  Button,
  Col,
  Tabs,
  Tab,
  ButtonToolbar,
  Alert,
  OverlayTrigger,
  Popover
} from 'react-bootstrap'
import SaveAsFileModal from './SaveAsFileModal'
import SaveAsInsightModal from './SaveAsInsightModal'
import './App.css'
import 'vega-tooltip/build/vega-tooltip.css'
import { API_HOST } from './constants'
import Header from './Header'
import { getStateUrl } from './urlState'
import VizCard from './VizCard'
import Editor from './Editor'
import SimpleSelect from './SimpleSelect'
import Encoding from './Encoding'
import VizEmpty from './VizEmpty'
import ResizableVegaLiteEmbed from './ResizableVegaLiteEmbed'
import CopyField from './CopyField'
import type { StoreType } from './Store'

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
  location: Object,
  store: StoreType
}> {
  data: ?Array<Object>

  loading: boolean
  errorLoading: boolean

  saveModalOpen: false | 'insight' | 'file'

  constructor(props) {
    super(props)
    extendObservable(this, {
      // data: null,
      loading: true,
      errorLoading: false,
      saveModalOpen: false
    })

    if (this.props.store.hasValidParams) {
      this.fetchQuery()
    }
  }

  getQueryUrl() {
    const { store } = this.props
    return `${API_HOST}/v0/sql/${store.agentid}/${
      store.datasetid
    }?includeTableSchema=true`
  }

  fetchQuery = async () => {
    const { store } = this.props
    runInAction(() => {
      store.setFields([])
      this.data = null
      this.loading = true
    })
    const res = await fetch(this.getQueryUrl(), {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${store.token}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({ query: store.query }).toString()
    })
    if (!res.ok) {
      runInAction(() => {
        this.loading = false
        this.errorLoading = true
      })
      return
    }
    const data = await res.json()
    const [dschema, ...rows] = data
    runInAction(() => {
      store.setFields([
        ...dschema.fields.map(f => ({
          name: f.name,
          rdfType: f.rdfType
        })),
        {
          name: '*',
          label: 'COUNT(*)',
          rdfType: 'http://www.w3.org/2001/XMLSchema#string'
        }
      ])
      this.data = rows
      this.loading = false
      if (this.props.store.config.encodings.length === 0) {
        this.props.store.reset()
      }
    })
  }

  renderShareOverlay() {
    return (
      <Popover id="popover-share-url" title="Share URL">
        <CopyField getValue={() => getStateUrl(this.props.store)} />
      </Popover>
    )
  }

  renderEmbed() {
    const { data } = this
    const { store } = this.props
    return (
      (data &&
        store.fields &&
        store.config.hasPossiblyValidChart && (
          <ResizableVegaLiteEmbed
            spec={store.config.generatedSpec}
            data={data}
            setDimensions={store.config.setDimensions}
            showResize={
              !store.config.hasManualSpec && !store.config.hasFacetField
            }
          />
        )) || <VizEmpty />
    )
  }

  render() {
    const { store } = this.props

    if (!store.hasValidParams) {
      return (
        <Fragment>
          {process.env.NODE_ENV === 'development' && <DevTools />}
          <Header />
          <Grid style={{ marginTop: 32 }}>
            <Row>
              <Col xs={12}>
                <h3>Valid parameters required</h3>
                <Link
                  to={{
                    pathname: '/',
                    search:
                      '?agentid=data-society&datasetid=iris-species&query=SELECT+%2A%0AFROM+iris'
                  }}
                >
                  Here's an example
                </Link>
              </Col>
            </Row>
          </Grid>
        </Fragment>
      )
    }

    if (this.loading || this.errorLoading) {
      return (
        <Fragment>
          {process.env.NODE_ENV === 'development' && <DevTools />}
          <Header />
          <Grid style={{ marginTop: 32 }}>
            <Row>
              <Col xs={12}>
                <h3>
                  {store.agentid}/{store.datasetid}
                </h3>
              </Col>
            </Row>
            <Row>
              <Col xs={6}>
                {this.loading ? (
                  <h4>Loading...</h4>
                ) : (
                  <h4>Error loading data</h4>
                )}
              </Col>
            </Row>
          </Grid>
        </Fragment>
      )
    }

    const { fields } = store

    return (
      <Fragment>
        {process.env.NODE_ENV === 'development' && <DevTools />}
        <Header agentid={store.agentid} datasetid={store.datasetid} />
        <Grid fluid className="App-topBar">
          <Row>
            <Col xs={12} className="App-topBarCol">
              <div className="App-topBarHeader">
                {store.agentid}/{store.datasetid}
              </div>
              <div className="App-topBarButtons">
                <ButtonToolbar>
                  <OverlayTrigger
                    trigger="click"
                    rootClose
                    placement="bottom"
                    overlay={this.renderShareOverlay()}
                  >
                    <Button
                      bsSize="xs"
                      disabled={!store.config.hasPossiblyValidChart}
                    >
                      Share URL
                    </Button>
                  </OverlayTrigger>
                  <Button
                    bsSize="xs"
                    onClick={() => (this.saveModalOpen = 'file')}
                    disabled={!store.config.hasPossiblyValidChart}
                  >
                    Save as file
                  </Button>
                  <Button
                    bsSize="xs"
                    onClick={() => (this.saveModalOpen = 'insight')}
                    disabled={!store.config.hasPossiblyValidChart}
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
              width: 400,
              backgroundColor: '#fff',
              boxShadow: '2px 0 4px 0 rgba(0,0,0,.1)',
              flexShrink: 0,
              zIndex: 4,
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <Tabs
              defaultActiveKey={store.config.hasManualSpec ? 2 : 1}
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
                {store.config.hasManualSpec && (
                  <Alert className="App-manualAlert">
                    You've manually edited the spec, so you can't modify these
                    fields.
                    <Button
                      bsStyle="link"
                      onClick={() => store.config.setManualSpec(null)}
                    >
                      Reset
                    </Button>
                  </Alert>
                )}
                <div className="App-title">Marks</div>
                <SimpleSelect
                  values={MARKS}
                  value={store.config.mark}
                  onChange={e => store.config.setMark(e)}
                  disabled={store.config.hasManualSpec}
                />
                <div className="App-title">
                  Configure Chart
                  <Button
                    bsStyle="link"
                    bsSize="xs"
                    className="pull-right"
                    style={{ paddingLeft: 0, paddingRight: 0 }}
                    onClick={() => store.config.addEncoding()}
                    disabled={store.config.hasManualSpec}
                  >
                    Add encoding
                  </Button>
                </div>
                {fields && (
                  <Fragment>
                    {store.config.encodings.map(e => {
                      return (
                        <Encoding
                          key={e._id}
                          fields={fields}
                          encoding={e}
                          disabled={store.config.hasManualSpec}
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
                disabled={!store.config.hasPossiblyValidChart}
              >
                {store.config.hasPossiblyValidChart && (
                  <Editor
                    onChange={e => {
                      this.props.store.config.setManualSpec(e)
                    }}
                    value={JSON.stringify(store.config.generatedSpec, null, 2)}
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
            spec={store.config.generatedSpec}
            defaultId={store.agentid + '/' + store.datasetid}
            data={this.data}
          />
        )}
        {this.saveModalOpen === 'file' && (
          <SaveAsFileModal
            onClose={() => (this.saveModalOpen = false)}
            spec={store.config.generatedSpec}
            defaultId={store.agentid + '/' + store.datasetid}
            data={this.data}
          />
        )}
      </Fragment>
    )
  }
}

export default inject('store')(observer(App))
